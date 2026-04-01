import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  template: `
    <main class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <section class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Política de Privacidad</h1>
        <p class="text-sm text-gray-500 mb-8">Última actualización: abril de 2026</p>

        <div class="space-y-6 text-gray-700 leading-7">
          <p>
            En Latin Group Corp respetamos su privacidad y protegemos su información personal conforme a principios de
            minimización, seguridad y transparencia reconocidos internacionalmente.
          </p>

          <p>
            Los datos personales y números de teléfono recolectados durante nuestro proceso de asesoría se utilizan
            exclusivamente para responder a su solicitud, enviar información relacionada con planes de salud y dar
            seguimiento a su atención.
          </p>

          <p>
            No compartimos, vendemos ni alquilamos su información personal o números de teléfono con terceros para
            fines de marketing no autorizados.
          </p>

          <p>
            Cuando el contacto se realiza por mensajería o llamadas, usted puede detener comunicaciones promocionales
            en cualquier momento siguiendo las instrucciones del canal utilizado, incluyendo la palabra STOP cuando
            aplique.
          </p>

          <p>
            Aplicamos medidas técnicas y administrativas razonables para proteger su información contra acceso no
            autorizado, alteración, pérdida o uso indebido.
          </p>

          <p>
            Si desea ejercer derechos de acceso, corrección o eliminación de datos, puede escribirnos por nuestros
            canales oficiales de contacto publicados en el sitio.
          </p>
        </div>
      </section>
    </main>
  `
})
export class PrivacyPolicyComponent {}
