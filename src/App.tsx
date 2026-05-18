import { useState } from 'react';
import { UsersDemo } from './components/UsersDemo';
import { GraphQLDemo } from './components/GraphQLDemo';
import { ScenariosDemo } from './components/ScenariosDemo';
import './App.css';

type Tab = 'rest' | 'graphql' | 'scenarios';

export default function App() {
  const [tab, setTab] = useState<Tab>('rest');

  return (
    <main className="app">
      <header>
        <h1>MSW Demo</h1>
        <p className="subtitle">
          Mock Service Worker intercepts network calls in the browser. Open DevTools &rarr; Network
          to see real <code>fetch</code> requests being served by handlers.
        </p>
      </header>

      <nav className="tabs">
        <button onClick={() => setTab('rest')} aria-pressed={tab === 'rest'}>
          REST (CRUD)
        </button>
        <button onClick={() => setTab('graphql')} aria-pressed={tab === 'graphql'}>
          GraphQL
        </button>
        <button onClick={() => setTab('scenarios')} aria-pressed={tab === 'scenarios'}>
          Error &amp; Latency
        </button>
      </nav>

      <section className="panel">
        {tab === 'rest' && <UsersDemo />}
        {tab === 'graphql' && <GraphQLDemo />}
        {tab === 'scenarios' && <ScenariosDemo />}
      </section>
    </main>
  );
}
