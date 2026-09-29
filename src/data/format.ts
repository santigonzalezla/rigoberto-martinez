const cop = new Intl.NumberFormat('es-CO', {maximumFractionDigits: 0});

/** 39900 → "$39.900" */
export const formatCOP = (value: number) => `$${cop.format(value)}`;
