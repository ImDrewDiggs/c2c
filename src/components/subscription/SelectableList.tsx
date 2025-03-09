
import { CheckCircle2, Circle } from "lucide-react";

interface SelectableItem {
  id: string;
  label: string;
  secondaryLabel?: string;
}

interface SelectableListProps {
  items: SelectableItem[];
  selectedItemId: string;
  onItemSelect: (itemId: string) => void;
  title: string;
}

const SelectableList = ({ items, selectedItemId, onItemSelect, title }: SelectableListProps) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{title}</label>
      <div className="grid gap-3">
        {items.map((item) => (
          <div 
            key={item.id}
            className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedItemId === item.id ? "bg-primary/10" : "hover:bg-secondary/5"
            }`}
            onClick={() => onItemSelect(item.id)}
          >
            <div className="mt-0.5 flex-shrink-0">
              {selectedItemId === item.id ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <h4 className="font-medium">{item.label}</h4>
                {item.secondaryLabel && (
                  <span className="text-green-600 font-semibold">{item.secondaryLabel}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectableList;
