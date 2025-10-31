import { useState, useEffect, useRef } from 'react';

export default function LazyImage({ src, alt, className, fallback }) {
  const [imageSrc, setImageSrc] = useState(fallback || null);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef();

  useEffect(() => {
    let observer;
    const img = imgRef.current;

    if (img && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '100px' // Start loading 100px before image is visible
        }
      );

      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      setImageSrc(src);
    }

    return () => {
      if (observer && img) {
        observer.unobserve(img);
      }
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && imageSrc && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        loading="lazy"
      />
    </div>
  );
}
