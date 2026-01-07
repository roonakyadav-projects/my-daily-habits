interface HabitCardYesNoProps {
  isDoneToday: boolean;
  onMarkDone: () => void;
}

const HabitCardYesNo = ({ isDoneToday, onMarkDone }: HabitCardYesNoProps) => {
  return (
    <button
      className={`btn-mark-done ${isDoneToday ? "done" : "active"}`}
      onClick={() => !isDoneToday && onMarkDone()}
      disabled={isDoneToday}
    >
      {isDoneToday ? "Done. Don't overthink it." : "Handled ✅"}
    </button>
  );
};

export default HabitCardYesNo;
