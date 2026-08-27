const COLOURS: Record<string, string> = {
  ontrack: "#12B76A",
  attention: "#F79009",
  overdue: "#F04438",
  closed: "#98A2B3",
};

export default function StatusChip({ status }: { status: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: COLOURS[status] ?? "#98A2B3",
      }}
    />
  );
}
