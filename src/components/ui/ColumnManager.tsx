// components/ColumnManager.tsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";

interface Column {
  key: string;
  label: string;
}

interface Props {
  allColumns: Column[];
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
}

export default function ColumnManager({
  allColumns,
  visibleColumns,
  setVisibleColumns,
}: Props) {
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [tempVisibleColumns, setTempVisibleColumns] = useState<string[]>([]);

  const handleOpen = () => {
    setTempVisibleColumns(visibleColumns);
    setShowColumnManager(true);
  };

  const handleApply = () => {
    setVisibleColumns(tempVisibleColumns);
    setShowColumnManager(false);
  };

  return (
    <>
      <Button variant="outline" onClick={handleOpen}>
        <Settings className="mr-2 h-4 w-4" />
        Manage Columns
      </Button>

      <Dialog open={showColumnManager} onOpenChange={setShowColumnManager}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Table Columns</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
            {allColumns.map((col) => (
              <label key={col.key} className="flex items-center gap-2">
                <Checkbox
                  checked={tempVisibleColumns.includes(col.key)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTempVisibleColumns([...tempVisibleColumns, col.key]);
                    } else {
                      setTempVisibleColumns(
                        tempVisibleColumns.filter((c) => c !== col.key)
                      );
                    }
                  }}
                />
                <span>{col.label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowColumnManager(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
