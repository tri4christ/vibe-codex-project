"use client";

import { createContext, createElement, useContext, useMemo, useState, type ReactNode } from 'react';
import { TOTAL_ONBOARDING_STEPS } from '@/lib/onboarding/flow';
import type {
  OnboardingData,
  VoiceProfileV1,
  ICPv1,
  OutreachPolicy,
  ReputationRules,
  SuccessPlanV1,
  WebSetupPlan,
  OnboardingRecap,
} from '@/lib/onboarding/types';

interface OnboardingState {
  open: boolean;
  activeBusinessId?: string;
  stepIndex: number;
  data: OnboardingData;
  recap?: OnboardingRecap;
}

interface OnboardingContextValue extends OnboardingState {
  openOnboarding: (businessId: string) => void;
  closeOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  saveVoice: (payload: VoiceProfileV1) => void;
  saveICP: (payload: ICPv1) => void;
  saveOutreach: (payload: OutreachPolicy) => void;
  saveReputation: (payload: ReputationRules) => void;
  saveSuccess: (payload: SuccessPlanV1) => void;
  saveWeb: (payload: WebSetupPlan) => void;
  setNotes: (notes: string) => void;
  setRecap: (recap: OnboardingRecap) => void;
}

const initialData: OnboardingData = {};

const initialState: OnboardingState = {
  open: false,
  activeBusinessId: undefined,
  stepIndex: 0,
  data: initialData,
  recap: undefined,
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);

  const value = useMemo<OnboardingContextValue>(() => {
    const openOnboarding = (businessId: string) => {
      setState({
        open: true,
        activeBusinessId: businessId,
        stepIndex: 0,
        data: {},
        recap: undefined,
      });
    };

    const closeOnboarding = () => setState(initialState);

    const updateData = (patch: Partial<OnboardingData>) => {
      setState(prev => ({ ...prev, data: { ...prev.data, ...patch } }));
    };

    const nextStep = () => setState(prev => ({ ...prev, stepIndex: Math.min(prev.stepIndex + 1, TOTAL_ONBOARDING_STEPS) }));
    const previousStep = () => setState(prev => ({ ...prev, stepIndex: Math.max(prev.stepIndex - 1, 0) }));
    const skipStep = () => nextStep();

    const saveVoice = (payload: VoiceProfileV1) => updateData({ voice: payload });
    const saveICP = (payload: ICPv1) => updateData({ icp: payload });
    const saveOutreach = (payload: OutreachPolicy) => updateData({ outreach: payload });
    const saveReputation = (payload: ReputationRules) => updateData({ reputation: payload });
    const saveSuccess = (payload: SuccessPlanV1) => updateData({ success: payload });
    const saveWeb = (payload: WebSetupPlan) => updateData({ web: payload });
    const setNotes = (notes: string) => updateData({ notes });
    const setRecap = (recap: OnboardingRecap) => setState(prev => ({ ...prev, recap, stepIndex: TOTAL_ONBOARDING_STEPS }));

    return {
      ...state,
      openOnboarding,
      closeOnboarding,
      nextStep,
      previousStep,
      skipStep,
      saveVoice,
      saveICP,
      saveOutreach,
      saveReputation,
      saveSuccess,
      saveWeb,
      setNotes,
      setRecap,
    };
  }, [state]);

	return createElement(OnboardingContext.Provider, { value }, children);
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export function useOnboardingControls() {
  return useOnboarding();
}
