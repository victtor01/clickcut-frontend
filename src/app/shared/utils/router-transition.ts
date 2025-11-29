import {
	animate,
	group,
	query,
	style,
	transition,
	trigger,
} from '@angular/animations';

// Define uma curva 'ease-in-out' mais suave e um pouco mais rápida
const easeCurve = '350ms ease-in-out'; 

export const scaleFade = trigger('routeAnimations', [
  // Transição de HomeLayoutPage para ConfigurePage
  transition('HomeLayoutPage => ConfigurePage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),

    group([
      // Animação da página que SAI (HomeLayout)
      query(':leave', [
        animate(easeCurve, style({ // ATUALIZADO
          opacity: 0,
          transform: 'scale(0.5)', 
        })),
      ], { optional: true }),

      // Animação da página que ENTRA (Configure)
      query(':enter', [
        style({
          opacity: 0,
          transform: 'scale(1.4)',
        }),
        animate(easeCurve, style({ // ATUALIZADO
          opacity: 1,
          transform: 'scale(1)',
        })),
      ], { optional: true }),
    ]),
  ]),

  // Transição de ConfigurePage de volta para HomeLayoutPage
  transition('ConfigurePage => HomeLayoutPage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }),
    ], { optional: true }),

    group([
      // Animação da página que SAI (Configure)
      query(':leave', [
        animate(easeCurve, style({ // ATUALIZADO
          opacity: 0,
          transform: 'scale(1.4)',
        })),
      ], { optional: true }),

      // Animação da página que ENTRA (HomeLayout)
      query(':enter', [
        style({
          opacity: 0,
          transform: 'scale(0.5)',
        }),
        animate(easeCurve, style({ // ATUALIZADO
          opacity: 1,
          transform: 'scale(1)',
        })),
      ], { optional: true }),
    ]),
  ]),
]);

