import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  template: `
    <main class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <section class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Términos y Condiciones</h1>
        <p class="text-sm text-gray-500 mb-8">Última actualización: abril de 2026</p>

        <div class="space-y-6 text-gray-700 leading-7">
          <p>
            Bienvenido a Latin Group Corp. Al utilizar este sitio web y enviar formularios de contacto, usted acepta
            estos Términos y Condiciones.
          </p>

          <p>
            La información publicada tiene carácter informativo y de orientación comercial sobre planes de salud.
            La disponibilidad de productos, requisitos y precios puede variar según la compañía, el estado y el perfil del
            solicitante.
          </p>

          <p>
            Usted se compromete a proporcionar información veraz y actualizada en formularios y solicitudes. Latin
            Group Corp puede rechazar solicitudes con datos incompletos, falsos o inconsistentes.
          </p>

          <p>
            Todo el contenido del sitio, incluyendo textos, marcas y elementos visuales, está protegido por derechos
            de propiedad intelectual y no puede reproducirse sin autorización previa.
          </p>

          <p>
            Latin Group Corp podrá actualizar estos términos cuando sea necesario para cumplir requisitos legales o de
            servicio. Los cambios entran en vigor al publicarse en esta página.
          </p>

          <p>
            Si no está de acuerdo con estos términos, le recomendamos no utilizar el sitio ni enviar información
            personal por este medio.
          </p>
        </div>
      </section>
    </main>
  `
})
export class TermsConditionsComponent {}
