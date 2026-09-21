/**
 * NutriBuddy 3D Card Tilt & Specular Glare Hook
 * 
 * Provides buttery-smooth 3D perspective tilt and specular light tracking.
 * Strictly active only on desktop devices with pointer/hover support.
 */

export function handleCard3DMouseMove(e) {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;

  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Subtle max ±4.5 deg rotation
  const rotateX = ((y - centerY) / centerY) * -4.5;
  const rotateY = ((x - centerX) / centerX) * 4.5;

  card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`;
  card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
  card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
}

export function handleCardSpotlight(e) {
  if (typeof window === 'undefined') return;
  if (!window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return;

  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
  card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
}

export function handleCard3DMouseLeave(e) {
  const card = e.currentTarget;
  card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  card.style.setProperty('--mouse-x', '50%');
  card.style.setProperty('--mouse-y', '50%');
}
