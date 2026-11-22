const PALETTE = [
  '#fb7185',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#818cf8',
  '#c084fc',
  '#f472b6',
];

interface RainbowTitleProps {
  text: string;
}

export function RainbowTitle({ text }: RainbowTitleProps) {
  let colorIndex = 0;

  return (
    <h1 className="title-banner" aria-label={text}>
      {Array.from(text).map((ch, idx) => {
        if (ch === ' ') {
          return (
            <span key={idx} className="title-rainbow-letter">
              {'\u00A0'}
            </span>
          );
        }
        const color = PALETTE[colorIndex % PALETTE.length];
        colorIndex++;
        return (
          <span key={idx} className="title-rainbow-letter" style={{ color }}>
            {ch}
          </span>
        );
      })}
    </h1>
  );
}
