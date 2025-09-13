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
   // --- Propriedades Internas ---
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private internalValue: number | null = null;

  // --- Inputs da Diretiva (convertidos para o padrão com setters) ---
  @Input() public showCurrencySymbol: boolean = true;
  
  private _min: number | null | undefined;
  @Input()
  set min(value: string | number | null | undefined) {
    this._min = this.coerceToNumber(value);
  }
  get min(): number | null | undefined { return this._min; }

  private _max: number | null | undefined;
  @Input()
  set max(value: string | number | null | undefined) {
    this._max = this.coerceToNumber(value);
  }
  get max(): number | null | undefined { return this._max; }

  private _step: number | null | undefined;
  @Input()
  set step(value: string | number | null | undefined) {
    this._step = this.coerceToNumber(value);
  }
  get step(): number | null | undefined { return this._step; }
  
  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.el.nativeElement.type = 'text';
    this.el.nativeElement.inputMode = 'decimal';
  }

  // O resto da sua diretiva continua igual...

  writeValue(value: number | null): void {
    this.internalValue = value;
    this.el.nativeElement.value = this.formatValue(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  @HostListener('input', ['$event.target.value'])
  onInput(viewValue: string): void {
    let numericValue = this.parseValue(viewValue);

    if (this.max !== null && this.max !== undefined && numericValue !== null && numericValue > this.max) {
      numericValue = this.max;
    }
    
    this.internalValue = numericValue;
    this.onChange(this.internalValue);
    this.el.nativeElement.value = this.formatValue(this.internalValue);
  }

  @HostListener('blur')
  onBlur(): void {
    let constrainedValue = this.internalValue;

    if (this.step && constrainedValue !== null) {
      const minVal = this.min ?? 0;
      constrainedValue = Math.round((constrainedValue - minVal) / this.step) * this.step + minVal;
    }

    if (this.min !== null && this.min !== undefined && (constrainedValue === null || constrainedValue < this.min)) {
      constrainedValue = this.min;
    }
    
    this.internalValue = constrainedValue;
    this.onChange(this.internalValue);
    this.el.nativeElement.value = this.formatValue(this.internalValue);
    this.onTouched();
  }

  private formatValue(value: number | null | undefined): string {
    // ...
    if (value === null || value === undefined) return '';
    const reais = Math.floor(value / 100);
    const centavos = (value % 100).toString().padStart(2, '0');
    const formattedReais = reais.toLocaleString('pt-BR');
    const prefix = this.showCurrencySymbol ? 'R$ ' : '';
    return `${prefix}${formattedReais},${centavos}`;
  }
  
  private parseValue(viewValue: string): number | null {
    // ...
    if (!viewValue) return null;
    const rawValue = viewValue.replace(/\D/g, '');
    return rawValue ? parseInt(rawValue, 10) : null;
  }
  
  private coerceToNumber(value: any): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }
}
