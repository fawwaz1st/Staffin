import { forwardRef } from 'react';

const Card = forwardRef(({ className = '', children, hover = false, subtle = false, ...props }, ref) => (
  <div
    ref={ref}
    className={`
      rounded-2xl
      bg-card
      ${subtle ? 'shadow-soft' : 'shadow-elevated'}
      ${hover ? 'hover:shadow-floating hover:-translate-y-1' : ''}
      transition-transform transition-shadow duration-200
      border border-divider/50
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
));

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col space-y-2 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-xl font-semibold text-primary ${className}`} {...props}>
    {children}
  </h3>
);

const CardDescription = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-secondary ${className}`} {...props}>
    {children}
  </p>
);

const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

Card.displayName = 'Card';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
