export interface RoleLegendDTO {
  groupName: string;
  permissions: Permission[];
}

export interface Permission {
  key: string;
  name: string;
  description: string;
}

// {
//     "groupName": "Agendamentos",
//     "permissions": [
//       {
//         "key": "CREATE_MANUAL_BOOKING_PAYMENT",
//         "name": "Registrar Pagamento Manual",
//         "description": "Permite registrar pagamentos manuais ao finalizar agendamentos."
//       }
//     ]
//   },
