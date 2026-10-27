interface CounterProps {
  count: number;
  area: string;
  translate: (key: string) => string;
  isOpen: boolean;
}

export function Counter({ count, area, translate, isOpen }: CounterProps) {
  return (
    <section class={'counter'} data-state={isOpen ? 'open' : 'closed'}>
      <h2 aria-label={translate('counter.label')}>{translate(`${area}.title`)}</h2>
      <p>{count}</p>
      <p>{count + count}</p>
      <p>{translate('counter.' + area)}</p>
      <p>{isOpen ? translate('counter.open') : translate('counter.closed')}</p>
    </section>
  );
}
