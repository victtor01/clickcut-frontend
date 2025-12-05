import { BookingStatus } from '@app/core/models/Booking';

export const bookingStatusMap: Record<BookingStatus, { label: string; classes: string, simpleLegend: string }> = {
  CREATED: {
    label: 'Criado',
    simpleLegend: 'Agendmento criado com sucesso!',
    classes: 'bg-stone-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20',
  },
  PENDING: {
    label: 'Pendente',
    simpleLegend: 'Aguardando confirmação do agendamento!',
    classes: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20',
  },
  CONFIRMED: {
    label: 'Confirmado',
    simpleLegend: 'Agendamento confirmado, aguardando início!',
    classes: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-400/30',
  },
  IN_PROGRESS: {
    label: 'Em Andamento',
    simpleLegend: 'Que legal! O agendamento está em andamento!',
    classes: 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30',
  },
  COMPLETED: {
    label: 'Concluído',
    simpleLegend: 'Obaa! Agendamento finalizado com sucesso!',
    classes: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-400/20',
  },
  PAID: {
    label: 'Pago',
    simpleLegend: 'Agendamento totalmente pago',
    classes: 'bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20',
  },
  CANCELLED: {
    label: 'Cancelado',
    simpleLegend: '',
    classes: 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/20',
  },
  NO_SHOW: {
    label: 'Não Compareceu',
    simpleLegend: '',
    classes: 'bg-stone-50 text-gray-700 ring-gray-600/10 dark:bg-gray-400/10 dark:text-gray-300 dark:ring-gray-400/20',
  },
  CANCELLED_BY_CLIENT: {
    label: '',
    simpleLegend: '',
    classes: ''
  },
  CANCELLED_BY_MANAGER: {
    label: '',
    simpleLegend: '',
    classes: ''
  },
  CANCELLED_LATE_BY_CLIENT: {
    label: '',
    simpleLegend: '',
    classes: ''
  }
};
