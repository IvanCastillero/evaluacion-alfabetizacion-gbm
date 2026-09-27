import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StepId,
  SessionData,
  AnswerRecord,
  AgeGroup,
  EmploymentStatus,
  EducationLevel,
  ResidenceMethod,
} from './types';
import zonasData from './content/zonas.json';
import { selectSessionItems, SessionItems } from './lib/itemSelector';
import { calculateSessionScores } from './lib/scoring';
import {
  generateUUID,
  getAnonDeviceId,
  checkRewardEligibility,
  recordRewardGranted,
  saveSession,
  saveActiveSession,
  getRecoverableSession,
  clearActiveSession,
} from './lib/storage';
import { HeaderNav } from './components/HeaderNav';
import { InactivityHandler } from './components/InactivityHandler';
import { RecoveryModal } from './components/RecoveryModal';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { AgeCheckScreen } from './screens/AgeCheckScreen';
import { AgeGroupScreen } from './screens/AgeGroupScreen';
import { EmploymentScreen } from './screens/EmploymentScreen';
import { EducationScreen } from './screens/EducationScreen';
import { ResidenceScreen } from './screens/ResidenceScreen';
import { PracticeScreen } from './screens/PracticeScreen';
import { Reto1Screen } from './screens/Reto1Screen';
import { Reto2Screen } from './screens/Reto2Screen';
import { TransitionScreen } from './screens/TransitionScreen';
import { Reto3Screen } from './screens/Reto3Screen';
import { Reto4Screen } from './screens/Reto4Screen';
import { CelebrationScreen } from './screens/CelebrationScreen';
import { SatisfactionScreen } from './screens/SatisfactionScreen';
import { RewardScreen } from './screens/RewardScreen';
import { ClosingScreen } from './screens/ClosingScreen';
import { AdminPanel } from './screens/AdminPanel';

type FlowStage =
  | 'P1'
  | 'P2'
  | 'P3'
  | 'P4'
  | 'P5'
  | 'P6'
  | 'P7'
  | 'P8'
  | 'P9_1'
  | 'P9_2'
  | 'P10_1'
  | 'P10_2'
  | 'P11'
  | 'P12_1'
  | 'P12_2'
  | 'P13_1'
  | 'P13_2'
  | 'P13_3'
  | 'P14'
  | 'P15'
  | 'P16'
  | 'P17';

export const App: React.FC = () => {
  // Detección de ruta inicial (/datos)
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname.includes('/datos') ||
      window.location.hash.includes('#/datos') ||
      new URLSearchParams(window.location.search).get('view') === 'datos'
    );
  });

  // Parámetros URL (kiosk, assisted)
  const [kioskId, setKioskId] = useState<string>('UNKNOWN');
  const [isAssisted, setIsAssisted] = useState<boolean>(false);

  // Sesión y estado de flujo
  const [session, setSession] = useState<SessionData | null>(null);
  const [stage, setStage] = useState<FlowStage>('P1');
  const [sessionItems, setSessionItems] = useState<SessionItems | null>(null);
  const [stars, setStars] = useState(0);

  // Registro de audio y tiempos
  const [audioUsedInCurrentScreen, setAudioUsedInCurrentScreen] = useState(false);
  const stepStartTimestamp = useRef<number>(Date.now());
  const [stepTimes, setStepTimes] = useState<Record<string, number>>({});

  // Recuperación tras recarga (<10 min)
  const [recoverableSession, setRecoverableSession] = useState<SessionData | null>(null);

  // Despedida amable cuando rechaza privacidad o edad
  const [farewellMessage, setFarewellMessage] = useState<string | null>(null);

  // Inicialización de parámetros URL y chequeo de sesión recuperable
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const kioskParam = params.get('kiosk');
      const assistedParam = params.get('assisted');

      // Validar si el kiosco existe en zonas.json
      if (kioskParam && (zonasData.kiosks as Record<string, any>)[kioskParam]) {
        setKioskId(kioskParam);
      } else {
        setKioskId('UNKNOWN');
      }

      setIsAssisted(assistedParam === '1');

      // Revisar si hay una sesión recuperable (<10 min)
      const rec = getRecoverableSession();
      if (rec && rec.status !== 'COMPLETED') {
        setRecoverableSession(rec);
      }
    }
  }, []);

  // Grabar tiempo transcurrido en el paso anterior y reiniciar timer
  const recordStepTime = useCallback((stepKey: string) => {
    const elapsed = Date.now() - stepStartTimestamp.current;
    setStepTimes((prev) => {
      const updated = { ...prev, [stepKey]: (prev[stepKey] || 0) + elapsed };
      return updated;
    });
    stepStartTimestamp.current = Date.now();
  }, []);

  // Actualizar sesión activa en localStorage cada vez que cambia
  useEffect(() => {
    if (session && session.status !== 'COMPLETED') {
      saveActiveSession({
        ...session,
        step_times_ms: stepTimes,
      });
    }
  }, [session, stepTimes]);

  // Manejo de abandono (inactividad o botón salir)
  const handleAbandon = useCallback(() => {
    if (!session || stage === 'P1' || stage === 'P2' || stage === 'P3') {
      // Si aún no ha aceptado consentimiento o apenas comenzó, no guardar
      setSession(null);
      setStage('P1');
      clearActiveSession();
      return;
    }

    const currentStepId: StepId = stage.startsWith('P9')
      ? 'P9'
      : stage.startsWith('P10')
      ? 'P10'
      : stage.startsWith('P12')
      ? 'P12'
      : stage.startsWith('P13')
      ? 'P13'
      : (stage as StepId);

    const abandonedSession: SessionData = {
      ...session,
      status: 'ABANDONED',
      last_step: currentStepId,
      step_times_ms: stepTimes,
      finished_at: new Date().toISOString(),
    };

    saveSession(abandonedSession);
    clearActiveSession();
    setSession(null);
    setStage('P1');
  }, [session, stage, stepTimes]);

  // P1: Empezar nueva sesión
  const handleStartWelcome = () => {
    recordStepTime('P1');
    const newItems = selectSessionItems();
    setSessionItems(newItems);
    setAudioUsedInCurrentScreen(false);
    setStars(0);

    const newSession: SessionData = {
      session_id: generateUUID(),
      kiosk_origin_id: kioskId,
      anon_device_id: getAnonDeviceId(),
      assisted: isAssisted,
      consent_version: 'CONS_PROTO_01',
      status: 'ABANDONED', // Será COMPLETED al final
      last_step: 'P1',
      answers: [],
      step_times_ms: {},
      started_at: new Date().toISOString(),
      synced: false,
    };

    setSession(newSession);
    setStage('P2');
  };

  // P2: Privacidad
  const handleAcceptPrivacy = () => {
    recordStepTime('P2');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) => (prev ? { ...prev, last_step: 'P2', consent_version: 'CONS_PROTO_01' } : null));
    setStage('P3');
  };

  const handleRejectPrivacy = () => {
    // No se guarda nada según regla estricta
    clearActiveSession();
    setSession(null);
    setFarewellMessage('Gracias por visitarnos. Respetamos tu decisión y no guardamos ningún dato.');
  };

  // P3: Edad (+18)
  const handleAgeYes = () => {
    recordStepTime('P3');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) => (prev ? { ...prev, last_step: 'P3' } : null));
    setStage('P4');
  };

  const handleAgeNo = () => {
    // Si es menor de 18: fin sin guardar datos
    clearActiveSession();
    setSession(null);
    setFarewellMessage('Esta actividad es para mayores de 18 años. ¡Muchas gracias por tu interés!');
  };

  // P4: Rango de edad
  const handleSelectAgeGroup = (group: AgeGroup) => {
    recordStepTime('P4');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            last_step: 'P4',
            demographics: { ...prev.demographics, age_group: group },
          }
        : null
    );
    setStage('P5');
  };

  // P5: Ocupación
  const handleSelectEmployment = (status: EmploymentStatus) => {
    recordStepTime('P5');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            last_step: 'P5',
            demographics: { ...prev.demographics, employment_status: status },
          }
        : null
    );
    setStage('P6');
  };

  // P6: Educación
  const handleSelectEducation = (level: EducationLevel) => {
    recordStepTime('P6');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            last_step: 'P6',
            demographics: { ...prev.demographics, education_level: level },
          }
        : null
    );
    setStage('P7');
  };

  // P7: Residencia
  const handleSelectResidence = (zoneId?: string, method?: ResidenceMethod) => {
    recordStepTime('P7');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            last_step: 'P7',
            residence_zone_id: zoneId,
            residence_method: method,
          }
        : null
    );
    setStage('P8');
  };

  // P8: Práctica completa
  const handleCompletePractice = () => {
    recordStepTime('P8');
    setAudioUsedInCurrentScreen(false);
    setSession((prev) => (prev ? { ...prev, last_step: 'P8' } : null));
    setStage('P9_1');
  };

  // Manejo común de respuestas a ítems
  const handleAddAnswer = (answer: AnswerRecord, nextStage: FlowStage, stepKey: string) => {
    recordStepTime(stepKey);
    setStars((prev) => prev + 1);
    setAudioUsedInCurrentScreen(false);

    setSession((prev) => {
      if (!prev) return null;
      const updatedAnswers = [...prev.answers, answer];
      return {
        ...prev,
        answers: updatedAnswers,
        last_step: stepKey as StepId,
      };
    });

    setStage(nextStage);
  };

  // P14: Celebración -> P15
  const handleContinueCelebration = () => {
    recordStepTime('P14');
    setAudioUsedInCurrentScreen(false);
    setStage('P15');
  };

  // P15: Satisfacción -> P16
  const handleSelectSatisfaction = (rating?: number) => {
    recordStepTime('P15');
    setAudioUsedInCurrentScreen(false);

    // Calcular elegibilidad de premio de 24h
    const rewardStatus = checkRewardEligibility();
    const isUnknown = kioskId === 'UNKNOWN';
    const isEligible = !isUnknown && rewardStatus.eligible;
    const rewardCode = isEligible ? Math.floor(1000 + Math.random() * 9000).toString() : '';

    if (isEligible) {
      recordRewardGranted();
    }

    setSession((prev) => {
      if (!prev) return null;
      const finalScores = calculateSessionScores(prev.answers);
      const updated: SessionData = {
        ...prev,
        last_step: 'P16',
        satisfaction: rating,
        scores: finalScores,
        reward: {
          eligible: isEligible,
          code: rewardCode,
          repeat_device: rewardStatus.repeat_device,
        },
      };
      return updated;
    });

    setStage('P16');
  };

  // P16: Premio -> P17
  const handleContinueReward = () => {
    recordStepTime('P16');
    setAudioUsedInCurrentScreen(false);
    setStage('P17');
  };

  // P17: Cierre final
  const handleFinishClosing = () => {
    recordStepTime('P17');

    if (session) {
      const finalSession: SessionData = {
        ...session,
        status: 'COMPLETED',
        last_step: 'P17',
        step_times_ms: { ...stepTimes, P17: Date.now() - stepStartTimestamp.current },
        finished_at: new Date().toISOString(),
      };
      saveSession(finalSession);
    }

    clearActiveSession();
    setSession(null);
    setStage('P1');
    setStars(0);
  };

  // Obtener texto de audio para la pantalla actual
  const getAudioTextForCurrentScreen = (): string => {
    if (!sessionItems) {
      if (stage === 'P1') {
        return kioskId === 'UNKNOWN'
          ? 'Juega dos minutos y ayuda a tu comunidad. Toca empezar para jugar.'
          : 'Juega dos minutos y gana un premio. Toca empezar para jugar.';
      }
      return '';
    }

    switch (stage) {
      case 'P1':
        return kioskId === 'UNKNOWN'
          ? 'Juega dos minutos y ayuda a tu comunidad. Toca empezar para jugar.'
          : 'Juega dos minutos y gana un premio. Toca empezar para jugar.';
      case 'P2':
        return 'Guardamos tu edad aproximada, tu zona y tus respuestas. No pedimos nombre, cédula ni teléfono. Sirve para llevar talleres a tu comunidad.';
      case 'P3':
        return '¿Tienes dieciocho años o más? Toca sí o no.';
      case 'P4':
        return '¿Cuál es tu edad? Toca tu grupo de edad.';
      case 'P5':
        return '¿A qué te dedicas? Toca una opción.';
      case 'P6':
        return '¿Hasta dónde estudiaste? Toca tu nivel de estudios.';
      case 'P7':
        return '¿Dónde vives? Toca tu corregimiento o toca otro lugar para buscar.';
      case 'P8':
        return 'Así se juega. Toca el botón azul para probar.';
      // En Retos 1 y 2: regla estricta: sólo la pregunta o instrucción corta, NUNCA el letrero ni la frase
      case 'P9_1':
        return sessionItems.reto1[0]?.prompt || '';
      case 'P9_2':
        return sessionItems.reto1[1]?.prompt || '';
      case 'P10_1':
      case 'P10_2':
        return 'Toca la palabra que falta.';
      case 'P11':
        return '¡Vas muy bien!';
      // Retos 3 y 4 leen la instrucción o tarjeta completa
      case 'P12_1':
        return sessionItems.reto3[0]?.audio || '';
      case 'P12_2':
        return sessionItems.reto3[1]?.audio || '';
      case 'P13_1':
        return sessionItems.reto4[0]?.audio || '';
      case 'P13_2':
        return sessionItems.reto4[1]?.audio || '';
      case 'P13_3':
        return sessionItems.reto4[2]?.audio || '';
      case 'P14':
        return '¡Lo lograste! Completaste todos los retos.';
      case 'P15':
        return '¿Te gustó la actividad? Toca una carita o toca saltar.';
      case 'P16':
        return kioskId === 'UNKNOWN'
          ? 'Muchas gracias. Tus respuestas ayudarán a tu comunidad.'
          : '¡Listo! Retira tu premio en el kiosco con tu código de cuatro dígitos.';
      case 'P17':
        return 'Muchas gracias por tu participación. Que tengas un buen día.';
      default:
        return '';
    }
  };

  // Índice de paso numérico para la barra de progreso
  const getStepProgressIndex = (): number => {
    const stageMap: Record<FlowStage, number> = {
      P1: 1,
      P2: 2,
      P3: 3,
      P4: 4,
      P5: 5,
      P6: 6,
      P7: 7,
      P8: 8,
      P9_1: 9,
      P9_2: 10,
      P10_1: 11,
      P10_2: 12,
      P11: 12.5,
      P12_1: 13,
      P12_2: 14,
      P13_1: 15,
      P13_2: 16,
      P13_3: 16.5,
      P14: 17,
      P15: 17,
      P16: 17,
      P17: 17,
    };
    return stageMap[stage] || 1;
  };

  // Renderizar la vista de Administración si está activada
  if (isAdminView) {
    return <AdminPanel onBackToApp={() => setIsAdminView(false)} />;
  }

  // Despedida amable (cuando rechaza consentimiento o edad)
  if (farewellMessage) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-lg border border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-3">Muchas Gracias</h2>
          <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
            {farewellMessage}
          </p>
          <button
            type="button"
            onClick={() => setFarewellMessage(null)}
            className="tap-target-48 w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between items-center text-slate-800">
      {/* Contenedor central con ancho máximo de 420 px en escritorio (Principio 8) */}
      <div className="w-full max-w-[420px] bg-slate-50 min-h-screen flex flex-col justify-between shadow-xl relative border-x border-slate-200/80">
        {/* Encabezado accesible */}
        <HeaderNav
          currentStepIndex={getStepProgressIndex()}
          totalSteps={17}
          starsCount={stars}
          showProgress={stage !== 'P1' && stage !== 'P17'}
          showExit={stage !== 'P1' && stage !== 'P17'}
          onExit={handleAbandon}
          assisted={isAssisted}
          audioText={getAudioTextForCurrentScreen()}
          onAudioTriggered={() => setAudioUsedInCurrentScreen(true)}
        />

        {/* Manejador de inactividad (45s aviso, 90s abandono) */}
        <InactivityHandler
          enabled={stage !== 'P1' && stage !== 'P17'}
          onAbandon={handleAbandon}
        />

        {/* Modal de recuperación si la página fue recargada */}
        {recoverableSession && (
          <RecoveryModal
            session={recoverableSession}
            onContinue={() => {
              setSession(recoverableSession);
              setSessionItems(selectSessionItems());
              setStage((recoverableSession.last_step as any) || 'P8');
              setRecoverableSession(null);
            }}
            onRestart={() => {
              clearActiveSession();
              setRecoverableSession(null);
              setSession(null);
              setStage('P1');
            }}
          />
        )}

        {/* Cuerpo de la pantalla actual */}
        <main className="flex-1 flex flex-col justify-between w-full overflow-x-hidden">
          {stage === 'P1' && (
            <WelcomeScreen
              isUnknownKiosk={kioskId === 'UNKNOWN'}
              onStart={handleStartWelcome}
            />
          )}

          {stage === 'P2' && (
            <PrivacyScreen
              onAccept={handleAcceptPrivacy}
              onReject={handleRejectPrivacy}
            />
          )}

          {stage === 'P3' && (
            <AgeCheckScreen onYes={handleAgeYes} onNo={handleAgeNo} />
          )}

          {stage === 'P4' && <AgeGroupScreen onSelect={handleSelectAgeGroup} />}

          {stage === 'P5' && (
            <EmploymentScreen onSelect={handleSelectEmployment} />
          )}

          {stage === 'P6' && (
            <EducationScreen onSelect={handleSelectEducation} />
          )}

          {stage === 'P7' && (
            <ResidenceScreen
              kioskOriginId={kioskId}
              onSelect={handleSelectResidence}
            />
          )}

          {stage === 'P8' && (
            <PracticeScreen onComplete={handleCompletePractice} />
          )}

          {stage === 'P9_1' && sessionItems && (
            <Reto1Screen
              item={sessionItems.reto1[0]}
              itemIndex={0}
              totalItems={2}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P9_2', 'P9')}
            />
          )}

          {stage === 'P9_2' && sessionItems && (
            <Reto1Screen
              item={sessionItems.reto1[1]}
              itemIndex={1}
              totalItems={2}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P10_1', 'P9')}
            />
          )}

          {stage === 'P10_1' && sessionItems && (
            <Reto2Screen
              item={sessionItems.reto2[0]}
              itemIndex={0}
              totalItems={2}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P10_2', 'P10')}
            />
          )}

          {stage === 'P10_2' && sessionItems && (
            <Reto2Screen
              item={sessionItems.reto2[1]}
              itemIndex={1}
              totalItems={2}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P11', 'P10')}
            />
          )}

          {stage === 'P11' && (
            <TransitionScreen onContinue={() => setStage('P12_1')} />
          )}

          {stage === 'P12_1' && sessionItems && (
            <Reto3Screen
              item={sessionItems.reto3[0]}
              itemIndex={0}
              totalItems={2}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P12_2', 'P12')}
            />
          )}

          {stage === 'P12_2' && sessionItems && (
            <Reto3Screen
              item={sessionItems.reto3[1]}
              itemIndex={1}
              totalItems={2}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P13_1', 'P12')}
            />
          )}

          {stage === 'P13_1' && sessionItems && (
            <Reto4Screen
              item={sessionItems.reto4[0]}
              itemIndex={0}
              totalItems={3}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P13_2', 'P13')}
            />
          )}

          {stage === 'P13_2' && sessionItems && (
            <Reto4Screen
              item={sessionItems.reto4[1]}
              itemIndex={1}
              totalItems={3}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P13_3', 'P13')}
            />
          )}

          {stage === 'P13_3' && sessionItems && (
            <Reto4Screen
              item={sessionItems.reto4[2]}
              itemIndex={2}
              totalItems={3}
              audioUsed={audioUsedInCurrentScreen}
              onAnswer={(ans) => handleAddAnswer(ans, 'P14', 'P13')}
            />
          )}

          {stage === 'P14' && (
            <CelebrationScreen onContinue={handleContinueCelebration} />
          )}

          {stage === 'P15' && (
            <SatisfactionScreen onSelect={handleSelectSatisfaction} />
          )}

          {stage === 'P16' && session && (
            <RewardScreen
              isUnknownKiosk={kioskId === 'UNKNOWN'}
              repeatDevice={session.reward?.repeat_device ?? false}
              rewardCode={session.reward?.code || '----'}
              isOnline={typeof navigator !== 'undefined' ? navigator.onLine : true}
              onContinue={handleContinueReward}
            />
          )}

          {stage === 'P17' && <ClosingScreen onFinish={handleFinishClosing} />}
        </main>

        {/* Pie de página discreto con enlace de datos */}
        <footer className="w-full py-1 text-center bg-slate-50 border-t border-slate-200/50">
          <button
            type="button"
            onClick={() => setIsAdminView(true)}
            className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            GBM RSE · Panel de Datos (/datos)
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
