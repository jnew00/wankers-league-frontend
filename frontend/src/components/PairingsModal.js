import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PairingsModal = ({ pairings, setPairings, onClose, onSave }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activePlayer, setActivePlayer] = useState(null); // Track the currently dragged item

  const onDragStart = ({ active }) => {
    const activeId = active.id.split("-")[1]; // Extract player_id from draggableId
    const player = pairings
      .flatMap((group) => group)
      .find((player) => player.player_id === parseInt(activeId, 10));

    setActivePlayer(player);
  };

  const onDragEnd = ({ active, over }) => {
    setActivePlayer(null); // Clear the active player when the drag ends

    if (!over || active.id === over.id) return;

    const sourceGroupIndex = pairings.findIndex((group) =>
      group.some((player) => `player-${player.player_id}` === active.id)
    );
    const destGroupIndex = pairings.findIndex((group) =>
      group.some((player) => `player-${player.player_id}` === over.id)
    );

    const sourceGroup = [...pairings[sourceGroupIndex]];
    const destGroup = [...pairings[destGroupIndex]];

    const activePlayerIndex = sourceGroup.findIndex(
      (player) => `player-${player.player_id}` === active.id
    );
    const overPlayerIndex = destGroup.findIndex(
      (player) => `player-${player.player_id}` === over.id
    );

    // Remove from source group and insert into destination group
    const [movedPlayer] = sourceGroup.splice(activePlayerIndex, 1);
    destGroup.splice(overPlayerIndex, 0, movedPlayer);

    const updatedPairings = [...pairings];
    updatedPairings[sourceGroupIndex] = sourceGroup;
    updatedPairings[destGroupIndex] = destGroup;

    setPairings(updatedPairings);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Edit Pairings</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex flex-wrap gap-4">
            {pairings.map((group, groupIndex) => (
              <SortableContext
                key={`group-${groupIndex}`}
                items={group.map((player) => `player-${player.player_id}`)}
              >
                <div className="flex-1 min-w-[150px] border p-4 rounded shadow-sm bg-gray-50">
                  <h4 className="font-semibold mb-2 text-center">
                    Group {groupIndex + 1}
                  </h4>
                  {group.map((player) => (
                    <SortablePlayer key={`player-${player.player_id}`} player={player} />
                  ))}
                </div>
              </SortableContext>
            ))}
          </div>
          <DragOverlay>
            {activePlayer ? (
              <div className="p-2 bg-blue-100 rounded shadow">
                {activePlayer.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={() => {
              onSave(pairings);
              onClose();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Accept
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const SortablePlayer = ({ player }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: `player-${player.player_id}`,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Fade dragged item
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 bg-gray-100 rounded mb-2 shadow cursor-pointer"
    >
      {player.name}
    </div>
  );
};

export default PairingsModal;
