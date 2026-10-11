import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { MockupSlide } from "@utils/mockup-slides";

interface MockupSlidesProps {
    slides: MockupSlide[];
    activeSlideId: string;
    templates: string[];
    isDisabled: boolean;
    onSelect: (slideId: string) => void;
    onAdd: (template: string) => void;
    onDuplicate: (slideId: string) => void;
    onDelete: (slideId: string) => void;
    onReorder: (slides: MockupSlide[]) => void;
}

interface SlideItemProps {
    slide: MockupSlide;
    position: number;
    isActive: boolean;
    isDisabled: boolean;
    canDelete: boolean;
    onSelect: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

const SlideItem = ({ slide, position, isActive, isDisabled, canDelete, onSelect, onDuplicate, onDelete }: SlideItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id, disabled: isDisabled });

    return (
        <li
            ref={setNodeRef}
            className={`slide-item ${isActive ? "active" : ""}`}
            style={{ transform: CSS.Transform.toString(transform), transition }}
        >
            <button
                type="button"
                className="slide-drag-handle"
                aria-label={`Arrastar o slide ${position}`}
                {...attributes}
                {...listeners}
            >
                <i className="bi bi-grip-vertical" aria-hidden="true"></i>
            </button>
            <button
                type="button"
                className="slide-select"
                onClick={onSelect}
                disabled={isDisabled}
                aria-current={isActive ? "true" : undefined}
            >
                <span className="slide-number">{position}</span>
                <span className="slide-template">{slide.template}</span>
            </button>
            <div className="slide-actions">
                <button
                    type="button"
                    className="btn btn-sm btn-transparent"
                    onClick={onDuplicate}
                    disabled={isDisabled}
                    aria-label={`Duplicar o slide ${position}`}
                    title="Duplicar"
                >
                    <i className="bi bi-copy" aria-hidden="true"></i>
                </button>
                <button
                    type="button"
                    className="btn btn-sm btn-transparent"
                    onClick={onDelete}
                    disabled={isDisabled || !canDelete}
                    aria-label={`Apagar o slide ${position}`}
                    title="Apagar"
                >
                    <i className="bi bi-trash" aria-hidden="true"></i>
                </button>
            </div>
        </li>
    );
};

const MockupSlides = ({
    slides,
    activeSlideId,
    templates,
    isDisabled,
    onSelect,
    onAdd,
    onDuplicate,
    onDelete,
    onReorder,
}: MockupSlidesProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = slides.findIndex((slide) => slide.id === active.id);
        const newIndex = slides.findIndex((slide) => slide.id === over.id);
        onReorder(arrayMove(slides, oldIndex, newIndex));
    };

    return (
        <div className="mockup-slides">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="h6 mb-0">Slides ({slides.length})</h2>
                <div className="dropdown">
                    <button
                        className="btn btn-sm btn-primary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        disabled={isDisabled}
                    >
                        <i className="bi bi-plus-lg" aria-hidden="true"></i> Slide
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                        {templates.map((template) => (
                            <li key={template}>
                                <button type="button" className="dropdown-item" onClick={() => onAdd(template)}>
                                    {template}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={slides.map((slide) => slide.id)} strategy={verticalListSortingStrategy}>
                    <ol className="slide-list">
                        {slides.map((slide, index) => (
                            <SlideItem
                                key={slide.id}
                                slide={slide}
                                position={index + 1}
                                isActive={slide.id === activeSlideId}
                                isDisabled={isDisabled}
                                canDelete={slides.length > 1}
                                onSelect={() => onSelect(slide.id)}
                                onDuplicate={() => onDuplicate(slide.id)}
                                onDelete={() => onDelete(slide.id)}
                            />
                        ))}
                    </ol>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default MockupSlides;
