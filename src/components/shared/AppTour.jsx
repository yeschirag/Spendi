import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const CustomTooltip = ({
  index,
  step,
  continuous,
  backProps,
  primaryProps,
  skipProps,
  isLastStep,
  tooltipProps,
}) => {
  return (
    <div 
      {...tooltipProps} 
      className="bg-[#111111] p-6 rounded-[2rem] border border-white/10 shadow-2xl max-w-sm w-full font-body font-sans"
    >
      <div className="mb-6 text-white text-left">
        {step.content}
      </div>
      <div className="flex items-center justify-between mt-2">
        {!isLastStep && (
          <button 
            {...skipProps} 
            onClick={(e) => {
              localStorage.setItem('spendi_tour_completed', 'true');
              if (skipProps?.onClick) skipProps.onClick(e);
            }}
            className="text-white/40 text-sm font-medium hover:text-white transition-colors" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Skip
          </button>
        )}
        <div className="flex items-center gap-4 ml-auto">
          {index > 0 && (
            <button {...backProps} className="text-white/60 text-sm font-medium hover:text-white transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
              Back
            </button>
          )}
          <button 
            {...primaryProps} 
            onClick={(e) => {
              if (isLastStep) {
                localStorage.setItem('spendi_tour_completed', 'true');
              }
              if (primaryProps?.onClick) primaryProps.onClick(e);
            }}
            className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:scale-105 transition-transform" 
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already completed the tour
    const hasCompletedTour = localStorage.getItem('spendi_tour_completed');
    if (!hasCompletedTour) {
      // Small delay to let the UI mount
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status, type, action } = data;
    
    // Use string literals to avoid import issues. 'finished' or 'skipped' are the standard statuses.
    if (['finished', 'skipped'].includes(status) || ['close', 'skip'].includes(action) || type === 'tour:end') {
      localStorage.setItem('spendi_tour_completed', 'true');
      setRun(false);
    }
  };

  const steps = [
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-4xl font-normal mb-3 text-white tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>Welcome to Spendi!</h3>
          <p className="text-sm font-light text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Let's take a quick tour to show you around your new financial dashboard.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      tooltipComponent: CustomTooltip,
    },
    {
      target: '.tour-balances',
      content: (
        <div>
          <h4 className="font-medium mb-1 text-white text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Your Net Balances</h4>
          <p className="text-sm font-light text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Here you can instantly see the total amount you owe others, and the total amount others owe you.</p>
        </div>
      ),
      placement: 'bottom',
      tooltipComponent: CustomTooltip,
    },
    {
      target: '.tour-add-expense',
      content: (
        <div>
          <h4 className="font-medium mb-1 text-white text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Log an Expense</h4>
          <p className="text-sm font-light text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Click this button to quickly add a new expense and split it with your friends.</p>
        </div>
      ),
      placement: 'top',
      tooltipComponent: CustomTooltip,
    },
    {
      target: '.tour-network',
      content: (
        <div>
          <h4 className="font-medium mb-1 text-white text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>Your Network</h4>
          <p className="text-sm font-light text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>Manage your friends, view individual balances, and see your mutual expense history here.</p>
        </div>
      ),
      placement: 'top',
      tooltipComponent: CustomTooltip,
    }
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress={false}
      showSkipButton
      hideCloseButton
      disableScrolling
      disableOverlayClose={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.85)',
        }
      }}
    />
  );
};
