interface CounterProps {
  count: number;
  translate: (key: string) => string;
  isOpen: boolean;
}

export function Counter({ count, translate, isOpen }: CounterProps) {
  return (
    <section class={'counter'} data-state={isOpen ? 'open' : 'closed'}>
      <h2 aria-label={translate('counter.label')}>{translate('counter.title')}</h2>
      <p>{count}</p>
      <p>{isOpen ? translate('counter.open') : translate('counter.closed')}</p>
    </section>
  );
}
