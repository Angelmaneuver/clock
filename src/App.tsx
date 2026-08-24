import './App.css';

import { Suspense, use, useState } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

import { FlipClock, Window } from '@/components/features';
import { LED } from '@/components/ui/led';
import { Spinner } from '@/components/ui/spinner';
import type { Initial } from '@/lib/tauri/window';
import { getInitialData } from '@/lib/tauri/window';

function App() {
  const [initial, setInitial] = useState(getInitialData());

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => setInitial(getInitialData())}>
      <Suspense
        fallback={
          <section className="loading">
            <Spinner />
          </section>
        }
      >
        <Wrapper initial={initial} reload={() => setInitial(getInitialData())} />
      </Suspense>
    </ErrorBoundary>
  );
}

function Wrapper({ initial, reload }: { initial: Promise<Initial>; reload: () => void }) {
  const data = use(initial);

  return (
    <Window className={data.kiosk ? 'kiosk' : undefined} reload={reload}>
      <div className="grid content-center justify-center">
        <FlipClock />
      </div>
    </Window>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Window label="" reload={async () => resetErrorBoundary()}>
      <div className="main">
        <LED
          style={{ width: 'calc(100vw - 0.5px - 0.5xp - 0.6em - 0.6em' }}
          text={`An error has occurred:${toString(error)}`}
        />
      </div>
    </Window>
  );
}

function toString(error: unknown): string {
  if (typeof error === 'string') {
    return (error as string).trim();
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return 'Unknown error.';
  }
}

export default App;
