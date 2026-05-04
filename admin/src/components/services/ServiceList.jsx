import {
  DndContext,
  closestCenter,
  DragOverlay,
  useDndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Power, Clock, GripVertical } from "lucide-react";
import { formatCurrency } from "@/constants";

// ── Shared display pieces ──────────────────────────────────────────────────

export function ServiceBadge({ isActive }) {
  return (
    <Badge
      className={`shrink-0 text-xs ${isActive ? "bg-green-100 text-green-700 border-0" : "bg-gray-100 text-gray-700 border-0"}`}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

function ServiceCardContent({ service, onEdit, onToggle, onDelete }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-momcha-text-dark truncate">{service.name}</p>
          <p className="text-xs text-momcha-text-light line-clamp-2 mt-0.5">
            {service.description || "-"}
          </p>
        </div>
        <ServiceBadge isActive={service.is_active} />
      </div>
      <div className="flex items-center gap-3 mb-3 text-xs text-momcha-text-dark">
        <span className="font-medium text-momcha-coral">{formatCurrency(service.price)}</span>
        <span className="text-momcha-text-light">•</span>
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-momcha-text-light" />
          <span>{service.duration_minutes} menit</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
          className="flex-1 h-8 text-xs text-momcha-coral border-momcha-coral"
        >
          <Edit size={12} className="mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggle(service)}
          className={`h-8 w-8 p-0 ${service.is_active ? "text-yellow-600 border-yellow-600" : "text-green-600 border-green-600"}`}
        >
          <Power size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(service)}
          className="h-8 w-8 p-0 text-red-600 border-red-600"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </>
  );
}

function RowColumns({ service }) {
  return (
    <>
      <div className="w-44 shrink-0 px-4 py-4">
        <p className="text-sm font-medium text-momcha-text-dark">{service.name}</p>
      </div>
      <div className="flex-1 min-w-0 px-4 py-4">
        <p className="text-sm text-momcha-text-light line-clamp-2 max-w-xs">
          {service.description || "-"}
        </p>
      </div>
      <div className="w-36 shrink-0 px-4 py-4">
        <p className="text-sm font-medium text-momcha-text-dark">{formatCurrency(service.price)}</p>
      </div>
      <div className="w-32 shrink-0 px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-momcha-text-dark">
          <Clock size={14} className="text-momcha-text-light" />
          {service.duration_minutes} menit
        </div>
      </div>
      <div className="w-24 shrink-0 px-4 py-4">
        <ServiceBadge isActive={service.is_active} />
      </div>
    </>
  );
}

function RowActions({ service, onEdit, onToggle, onDelete }) {
  return (
    <div className="w-32 shrink-0 px-4 py-4 flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(service)}
        className="text-momcha-coral hover:bg-momcha-cream"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(service)}
        className={service.is_active ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"}
      >
        <Power size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(service)}
        className="text-red-600 hover:bg-red-50"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}

// ── DnD items ──────────────────────────────────────────────────────────────

function SortableCard({ service, onEdit, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      className="p-4 hover:bg-momcha-cream transition-colors"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing touch-none text-gray-300 hover:text-gray-400"
          tabIndex={-1}
        >
          <GripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <ServiceCardContent service={service} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

function SortableRow({ service, onEdit, onToggle, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: service.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      className="flex items-center border-b border-momcha-peach hover:bg-momcha-cream transition-colors"
    >
      <div className="w-10 shrink-0 flex items-center justify-center py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-gray-300 hover:text-gray-400"
          tabIndex={-1}
        >
          <GripVertical size={16} />
        </button>
      </div>
      <RowColumns service={service} />
      <RowActions service={service} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
    </div>
  );
}

function StaticRow({ service, onEdit, onToggle, onDelete }) {
  return (
    <div className="flex items-center border-b border-momcha-peach hover:bg-momcha-cream transition-colors">
      <div className="w-10 shrink-0" />
      <RowColumns service={service} />
      <RowActions service={service} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
    </div>
  );
}

// ── DragOverlay reads active item from its parent DndContext ───────────────

function SortableDragOverlay({ services, renderItem }) {
  const { active } = useDndContext();
  const service = active ? services.find((s) => s.id === active.id) : null;
  return <DragOverlay>{service ? renderItem(service) : null}</DragOverlay>;
}

function DragCard({ service }) {
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border border-momcha-peach opacity-90">
      <div className="flex items-start gap-2">
        <GripVertical size={16} className="mt-0.5 shrink-0 text-gray-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-momcha-text-dark truncate">{service.name}</p>
          <p className="text-xs text-momcha-text-light mt-0.5">
            {formatCurrency(service.price)} · {service.duration_minutes} menit
          </p>
        </div>
      </div>
    </div>
  );
}

function DragRow({ service }) {
  return (
    <div
      className="flex items-center bg-white shadow-lg border border-momcha-peach rounded-lg opacity-95"
      style={{ minWidth: 680 }}
    >
      <div className="w-10 shrink-0 flex items-center justify-center py-4">
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <RowColumns service={service} />
    </div>
  );
}

function DesktopHeader() {
  return (
    <div className="flex items-center bg-momcha-cream border-b border-momcha-peach">
      <div className="w-10 shrink-0" />
      <div className="w-44 shrink-0 px-4 py-3 text-xs font-medium text-momcha-text-dark">Service</div>
      <div className="flex-1 px-4 py-3 text-xs font-medium text-momcha-text-dark">Deskripsi</div>
      <div className="w-36 shrink-0 px-4 py-3 text-xs font-medium text-momcha-text-dark">Harga</div>
      <div className="w-32 shrink-0 px-4 py-3 text-xs font-medium text-momcha-text-dark">Durasi</div>
      <div className="w-24 shrink-0 px-4 py-3 text-xs font-medium text-momcha-text-dark">Status</div>
      <div className="w-32 shrink-0 px-4 py-3 text-xs font-medium text-momcha-text-dark text-right">Aksi</div>
    </div>
  );
}

// ── Public component ───────────────────────────────────────────────────────

/**
 * ServiceList — list service dengan dukungan DnD untuk mobile dan desktop.
 * DnD hanya aktif ketika isDraggable=true (tidak ada search/filter aktif).
 *
 * @param {Array}    services     - List ordered (dipakai saat isDraggable)
 * @param {Array}    filtered     - List filtered (dipakai saat !isDraggable)
 * @param {boolean}  isDraggable  - true ketika tidak ada search/filter aktif
 * @param {object}   dndProps     - { sensors, collisionDetection, onDragEnd }
 * @param {Function} onEdit       - (service) => void
 * @param {Function} onToggle     - (service) => void
 * @param {Function} onDelete     - (service) => void
 */
export function ServiceList({ services, filtered, isDraggable, dndProps, onEdit, onToggle, onDelete }) {
  const actions = { onEdit, onToggle, onDelete };

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden">
        {isDraggable ? (
          <DndContext {...dndProps}>
            <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-momcha-peach">
                {services.map((s) => (
                  <SortableCard key={s.id} service={s} {...actions} />
                ))}
              </div>
            </SortableContext>
            <SortableDragOverlay services={services} renderItem={(s) => <DragCard service={s} />} />
          </DndContext>
        ) : (
          <div className="divide-y divide-momcha-peach">
            {filtered.map((s) => (
              <div key={s.id} className="p-4 hover:bg-momcha-cream transition-colors">
                <ServiceCardContent service={s} {...actions} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <DesktopHeader />
        {isDraggable ? (
          <DndContext {...dndProps}>
            <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {services.map((s) => (
                <SortableRow key={s.id} service={s} {...actions} />
              ))}
            </SortableContext>
            <SortableDragOverlay services={services} renderItem={(s) => <DragRow service={s} />} />
          </DndContext>
        ) : (
          filtered.map((s) => <StaticRow key={s.id} service={s} {...actions} />)
        )}
      </div>
    </>
  );
}
