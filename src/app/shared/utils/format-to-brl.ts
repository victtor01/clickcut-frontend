export function formatToBRL(value: string | number | null): string {
  if (value === null || value === undefined) return 'R$ 0,00';

  let numberValue: number;
	
  if (typeof value === 'string') {
    numberValue = Number(value.replace(/[^\d-]/g, ''));
  } else {
    numberValue = value;
  }

  if (isNaN(numberValue)) return 'R$ 0,00';

  // Divide por 100 para converter de centavos para reais
  const reais = numberValue / 100;

  return reais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
