interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabNavProps<T extends string = string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function TabNav<T extends string>({
  tabs,
  active,
  onChange,
}: TabNavProps<T>) {
  return (
    <div role="tablist" className="flex gap-2 border-b border-[#ffffff15]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            active === tab.id
              ? "border-b-2 border-[#a78bfa] text-[#a78bfa]"
              : "text-[#888] hover:text-[#aaa]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
