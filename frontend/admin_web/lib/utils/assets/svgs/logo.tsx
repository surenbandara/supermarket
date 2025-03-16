export function AppLogo() {
  return (
    <div className="flex items-center justify-center relative p-2">
      <svg
        width="160"
        height="48"
        viewBox="0 0 160 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="50%" 
          y="50%" 
          fontSize="20"  // Larger font for a bold logo appearance
          fontFamily="'Arial Black', sans-serif"  // Use a bold sans-serif font for logos
          fill="#000000"  // Keep text color black (can change for a more colorful design)
          fontWeight="bold"  // Make the text bold
          textAnchor="middle" 
          dominantBaseline="middle"
        >
          SUPERMARKET
        </text>
      </svg>
    </div>
  );
}
