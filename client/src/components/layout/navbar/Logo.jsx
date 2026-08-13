import { Link } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";

const Logo = () => {
  const { theme } = useTheme();

  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex-shrink-0 flex items-center">
      <Link to="/" className="flex items-center">
        <img
          src={theme === 'dark' ? 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786183228/ChatGPT_Image_Aug_8_2026_03_30_05_PM_a98rks.png' : 'https://res.cloudinary.com/dwfalgx6c/image/upload/v1786181989/cross_logo_xlumhw.webp'}
          className="h-26 md:h-30 w-auto object-contain"
          alt="Logo"
        />
      </Link>
    </div>
  );
};

export default Logo;
