import { Directive, ElementRef, forwardRef, HostListener, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appMoneyInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyInputDirective),
      multi: true,
    },
  ],
})
export class MoneyInputDirective implements ControlValueAccessor, OnInit {
  // Funções que o Angular nos dará para atualizar o form model
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  @Input()
  public showCurrencySymbol: boolean = true;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.el.nativeElement.type = 'text';
  }

  // O Angular chama este método para escrever um valor do model na view
  writeValue(value: number | null): void {
    this.el.nativeElement.value = this.formatValue(value);
  }

  // Registra a função de callback para quando o valor mudar
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  // Registra a função de callback para o evento 'touched'
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    // Remove tudo que não for dígito. A regex correta é /\D/g
    const rawValue = value.replace(/\D/g, '');

    // Converte para número (ex: '12345' -> 12345)
    const numericValue = rawValue ? parseInt(rawValue, 10) : null;

    // Atualiza o valor no model do formulário (o valor "real")
    this.onChange(numericValue);

    // Atualiza o valor na view (o valor formatado que o usuário vê)
    this.el.nativeElement.value = this.formatValue(numericValue);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  private formatValue(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }

    const reais = Math.floor(value / 100);
    const centavos = (value % 100).toString().padStart(2, '0');

    const formattedReais = reais.toLocaleString('pt-BR');

    const prefix = this.showCurrencySymbol ? 'R$ ' : '';

    return `${prefix}${formattedReais},${centavos}`;
  }
}
