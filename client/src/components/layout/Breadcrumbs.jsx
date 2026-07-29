import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show on home page
    if (location.pathname === '/') {
        return null;
    }

    const getDisplayName = (segment, index) => {
        // If it looks like a long ID (simple heuristic: length > 12 and contains numbers)
        if (segment.length > 20) {
            const prev = pathnames[index - 1];
            if (prev === 'orders') return `Order ${segment.slice(0, 8)}`;
            if (prev === 'products') return `Product Details`;
            if (prev === 'category') return `Category`;
            return `${segment.slice(0, 8)}...`;
        }
        
        // Custom mappings
        if (segment === 'products') return 'Products';
        if (segment === 'orders') return 'My Orders';
        if (segment === 'cart') return 'Shopping Cart';
        if (segment === 'wishlist') return 'My Wishlist';
        if (segment === 'profile') return 'My Profile';
        
        // Default: Capitalize and remove dashes
        return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    };

    return (
        <div className="bg-gray-50/50 border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-gray-500">
                <div className="flex items-center gap-2 flex-wrap">
                    <Link to="/" className="hover:text-primary flex items-center gap-1">
                        Home
                    </Link>
                    {pathnames.map((name, index) => {
                        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathnames.length - 1;
                        const displayName = getDisplayName(name, index);

                        return (
                            <React.Fragment key={name}>
                                <ChevronRight size={14} className="text-gray-400" />
                                {isLast ? (
                                    <span className="text-gray-900 font-medium truncate max-w-[200px]" title={name}>
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link to={routeTo} className="hover:text-primary transition-colors">
                                        {displayName}
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Breadcrumbs;