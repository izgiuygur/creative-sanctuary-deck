import { useState, useCallback, useEffect } from 'react';
import type { ElementFilter as ElementFilterType } from '../../types/card';
import { elements, elementOrder } from '../../data/elements';

const filterOptions: Array<{ id: ElementFilterType; label: string }> = [
  { id: 'all', label: 'All' },
  ...elementOrder.map((id) => ({ id, label: elements[id].name })),
];

export default function ElementFilter() {
  const [active, setActive] = useState<ElementFilterType>('all');

  const handleClick = useCallback((filter: ElementFilterType) => {
    setActive(filter);
    window.dispatchEvent(
      new CustomEvent('element-filter-change', { detail: { element: filter } })
    );
  }, []);

  return (
    <div className="element-filter">
      {filterOptions.map(({ id, label }) => (
        <button
          key={id}
          className={`element-filter__btn${active === id ? ' element-filter__btn--active' : ''}`}
          data-element={id}
          onClick={() => handleClick(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
