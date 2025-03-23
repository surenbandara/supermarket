export function AppLogo() {
  return (
    <div className="flex items-center justify-center relative p-2">
      <svg
        width="250" // Adjusted width to fit both image and text
        height="80"  // Adjusted height for better visibility
        viewBox="0 0 250 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Logo Image */}
        <image 
          href="/logo.png" 
          x="5" 
          y="5" 
          width="70" 
          height="70"
        />
      </svg>
    </div>
  );
}
