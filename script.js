      // NAVEGACIÓN
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');

                const target = this.getAttribute('data-target');
                document.querySelectorAll('.view-section').forEach(s => {
                    s.classList.remove('active');
                    s.style.display = 'none';
                });
                const active = document.getElementById(target);
                active.classList.add('active');
                active.style.display = 'block';
            });
        });

     // MOTOR DE CÁLCULO UNIFICADO


function actualizarTodo() {
    // 1. DATOS BASE
    const smmlv = parseFloat(document.getElementById('conf_smlv').value) || 0;
    const aux_config = parseFloat(document.getElementById('conf_aux').value) || 0;
    const sueldo = parseFloat(document.getElementById('sueldo_base').value) || 0;
    const dias = calcularDias();
    const f = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

    const aplica_aux = (sueldo < (smmlv * 2)) ? "si" : "no";
    document.getElementById('aplica_aux').value = aplica_aux;
    const aux_real = aplica_aux === 'si' ? aux_config : 0;
    const baseP = sueldo + aux_real;

    /// --- [PARTE A: COSTOS EMPLEADOR - OPTIMIZADO] ---
// Pension Empleador fija al 12% (0.12)
const p_patrono = sueldo * 0.12; 

// ARL: Intentamos leer el selector, si no existe usamos el nivel I por defecto
const selector_arl = document.getElementById('cfg_arl');
let pct_arl_e = 0.00522; // Nivel I por defecto
let texto_nivel = "Nivel I";

if (selector_arl) {
    pct_arl_e = parseFloat(selector_arl.value) / 100;
    texto_nivel = selector_arl.options[selector_arl.selectedIndex].text.split('(')[0].trim();
}

const p_arl = sueldo * pct_arl_e;
const p_caja = sueldo * 0.04; // Caja de Compensación fija 4%
const p_provisiones = baseP * 0.2183; // Primas, Cesantías, etc. (Aprox 21.83%)

// Actualización de la interfaz lateral (Dashboard de Costos)
if(document.getElementById('costo_side_pens')) {
    document.getElementById('costo_side_pens').innerText = f.format(p_patrono);
    document.getElementById('costo_side_arl').innerText = f.format(p_arl);
    document.getElementById('costo_side_caja').innerText = f.format(p_caja);
    document.getElementById('costo_side_prov').innerText = f.format(p_provisiones);
    
    const etiquetaArl = document.getElementById('costo_side_arl').parentElement.querySelector('span');
    if(etiquetaArl) etiquetaArl.innerText = `ARL (${texto_nivel})`;
    
    const total_gasto_jefe = sueldo + aux_real + p_patrono + p_arl + p_caja + p_provisiones;
    document.getElementById('costo_side_total').innerText = f.format(total_gasto_jefe);
}
// --- [FIN PARTE EMPLEADOR] ---

    // --- [PARTE B: NETO REAL TRABAJADOR - PARA QUE COINCIDA CON PDF] ---
    
    // Recargos e Indemnización
    const vho = sueldo / 240;
    const totalRecargos = (vho * 0.35 * (parseFloat(document.getElementById('h_rn')?.value) || 0)) + 
                         (vho * 0.75 * (parseFloat(document.getElementById('h_df')?.value) || 0)) + 
                         (vho * 1.25 * (parseFloat(document.getElementById('h_hed')?.value) || 0)) + 
                         (vho * 1.75 * (parseFloat(document.getElementById('h_hen')?.value) || 0));

    const v_indem = document.getElementById('check_indem')?.checked ? (parseFloat(document.getElementById('dias_indem')?.value) || 0) * (sueldo / 30) : 0;

    // Prestaciones Sociales
    const esAprendiz = document.getElementById('emp_contrato').value === "Aprendizaje";
    const r_prima = esAprendiz ? 0 : (baseP * dias) / 360;
    const r_cesantias = esAprendiz ? 0 : (baseP * dias) / 360;
    const r_intCes = esAprendiz ? 0 : (r_cesantias * dias * 0.12) / 360;
    const r_vacas = esAprendiz ? 0 : (sueldo * dias) / 720;
    const total_prestaciones = r_prima + r_cesantias + r_intCes + r_vacas;

    // Nómina y Deducciones (Aquí está la clave de la diferencia)
    const sueldo_periodo = (sueldo / 30) * dias;
    const aux_periodo = (aux_real / 30) * dias;
    
    
  // IBC para salud y pensión es Sueldo + Recargos
const ibc_periodo = sueldo_periodo + totalRecargos;
const r_salud = ibc_periodo * 0.04; // Aquí ya lo tienes fijo al 4% (0.04), ¡bien!
const r_pension = esAprendiz ? 0 : (ibc_periodo * 0.04);
    
    // Descuentos manuales
    const r_cons = parseFloat(document.getElementById('d_consumos')?.value) || 0;
    const r_otros = parseFloat(document.getElementById('d_otros')?.value) || 0;
    
    const total_deducciones = r_salud + r_pension + r_cons + r_otros;
    const total_ingresos = sueldo_periodo + aux_periodo + totalRecargos + v_indem;

    // NETO FINAL REAL
    const neto_final_real = total_prestaciones + total_ingresos - total_deducciones;

    // ACTUALIZAR TARJETA DE RESUMEN
    if(document.getElementById('resumen_prestaciones')){
        document.getElementById('resumen_prestaciones').innerText = f.format(total_prestaciones);
        document.getElementById('resumen_nomina_extras').innerText = f.format(total_ingresos);
        document.getElementById('resumen_deducciones').innerText = "- " + f.format(total_deducciones);
        document.getElementById('resumen_total_neto').innerText = f.format(neto_final_real);
    }

    // Indicadores superiores
    document.getElementById('val_dia').innerText = f.format(sueldo / 30);
    document.getElementById('val_hora').innerText = f.format(vho);
    document.getElementById('val_base_pres').innerText = f.format(baseP);
    document.getElementById('display_dias').innerText = dias;

    // AGREGA ESTA LÍNEA AL FINAL DE actualizarTodo()
 // Busca el final de actualizarTodo y reemplaza el return por este:
   // Reemplaza tu return actual por este al final de actualizarTodo
    return { 
        f, dias, sueldo, baseP, aux_real, 
        total_prestaciones, total_ingresos, total_deducciones, 
        neto_final_real, r_prima, r_cesantias, r_intCes, r_vacas,
        totalRecargos, v_indem , r_cons, r_otros,
        r_salud, r_pension
    };
}

      function calcularDias() {
    const startVal = document.getElementById('fecha_inicio').value;
    const endVal = document.getElementById('fecha_fin').value;
    
    if (!startVal || !endVal) return 0;

    // Separamos por guiones para evitar el error de zona horaria de JavaScript
    const s = startVal.split('-');
    const e = endVal.split('-');

    let y1 = parseInt(s[0]), m1 = parseInt(s[1]), d1 = parseInt(s[2]);
    let y2 = parseInt(e[0]), m2 = parseInt(e[1]), d2 = parseInt(e[2]);

    // Lógica comercial de 360 días (Ajuste de días 31)
    if (d1 === 31) d1 = 30;
    // Si es febrero y es el último día (28 o 29), se puede tratar como 30 según norma comercial
    if (m1 === 2 && d1 >= 28) d1 = 30; 
    
    if (d2 === 31) d2 = 30;
    if (m2 === 2 && d2 >= 28) d2 = 30;

    const total = ((y2 - y1) * 360) + ((m2 - m1) * 30) + (d2 - d1) + 1;
    return total;
}

        function toggleSec(id) {
            const el = document.getElementById(id);
            el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }

// Función principal para Generar y abrir el Modal

function generarPrevisualizacion() {

    // 1. OBTENEMOS LOS DATOS (¡No los comentes! Son necesarios para el resto)
    const data = actualizarTodo();
    const f = data.f;

    // 2. IDENTIFICAMOS EL TIPO DE CONTRATO
    const selContrato = document.getElementById('emp_contrato');
    const esAprendiz = selContrato.value === "Aprendizaje";

    // 3. NÓMINA Y RECARGOS
// 3.1. Calculamos el valor de la hora ordinaria
const vho = data.sueldo / 240;

// 3.2. Capturamos el número de HORAS de todos los inputs nuevos
const horasNocturnas = parseFloat(document.getElementById('h_rn').value) || 0;
const horasDominicales = parseFloat(document.getElementById('h_df').value) || 0;
const horasExtraDiur = parseFloat(document.getElementById('h_hed').value) || 0; // Nueva
const horasExtraNoct = parseFloat(document.getElementById('h_hen').value) || 0; // Nueva

// 3.3. Convertimos esas horas a PESOS según los porcentajes de ley
const rn = vho * 0.35 * horasNocturnas;  // Recargo Nocturno (35%)
const df = vho * 0.75 * horasDominicales; // Recargo Dominical (75%)
const hed = vho * 1.25 * horasExtraDiur;  // Hora Extra Diurna (1.25) 
const hen = vho * 1.75 * horasExtraNoct;  // Hora Extra Nocturna (1.75) 

// 3.4. Sumamos todos los recargos para el gran total
const totalRecargosYExtras = rn + df + hed + hen;

// 3.5. Cálculo de Indemnización (Sigue igual)
const indem = document.getElementById('check_indem').checked ? (parseFloat(document.getElementById('dias_indem').value) || 0) * (data.sueldo/30) : 0;

    // 4. PRESTACIONES (Validamos si es aprendiz)
    const prima = esAprendiz ? 0 : (data.baseP * data.dias) / 360;
    const cesantias = esAprendiz ? 0 : (data.baseP * data.dias) / 360;
    const intCes = esAprendiz ? 0 : (cesantias * data.dias * 0.12) / 360;
    const vacas = esAprendiz ? 0 : (data.sueldo * data.dias) / 720;

   // 5. SEGURIDAD SOCIAL (VALORES FIJOS 4%)
const ibc = data.sueldo + totalRecargosYExtras;    
const salud_t = ibc * 0.04; // Valor fijo, ya no busca en el HTML
    
// EL APRENDIZ NO PAGA PENSIÓN
const pens_t = esAprendiz ? 0 : ibc * 0.04; // Valor fijo

    document.getElementById('modalCompartir').style.display = 'flex';

    // 6. Deducciones extras (Tomadas de los datos procesados)
    const cons = data.r_cons;
    const otros = data.r_otros;

    // 7. LLENAR DATOS BÁSICOS EN EL PDF
    document.getElementById('p_empresa_header').innerText = document.getElementById('conf_razon').value;
    document.getElementById('p_nit_header').innerText = "NIT: " + document.getElementById('conf_nit').value;
    document.getElementById('pdf_nombre').innerText = document.getElementById('emp_nombre').value;
    document.getElementById('pdf_cc').innerText = document.getElementById('emp_cc').value;
    document.getElementById('pdf_cargo').innerText = document.getElementById('emp_cargo').value;
    
    // Capturar el tipo de contrato y el nombre de la obra si existe
const nombreObra = document.getElementById('nombre_obra').value;
const textoContrato = selContrato.options[selContrato.selectedIndex].text;

// Si el usuario escribió una obra, se verá: "Obra o Labor (Nombre de la obra)"
document.getElementById('pdf_contrato').innerText = nombreObra ? `${textoContrato} (${nombreObra})` : textoContrato;

document.getElementById('pdf_fi').innerText = document.getElementById('fecha_inicio').value;
document.getElementById('pdf_ff').innerText = document.getElementById('fecha_fin').value;
document.getElementById('pdf_dt').innerText = data.dias;
document.getElementById('pdf_sal').innerText = data.f.format(data.sueldo); // Agregamos data.f
document.getElementById('pdf_auxt').innerText = data.f.format(data.aux_real);
document.getElementById('pdf_base_p').innerText = data.f.format(data.baseP);

   // 7. LLENAR TABLAS PDF
document.getElementById('pdf_tabla_pres').innerHTML = `
    <tr>
        <td>Prima de Servicios</td>
        <td>${data.f.format(data.baseP)}<br><small style="color:#64748b">(Sueldo + Aux. Transp.)</small></td>
        <td>${data.dias}</td>
        <td>${data.f.format(data.r_prima)}</td>
    </tr>
    <tr>
        <td>Cesantías</td>
        <td>${data.f.format(data.baseP)}<br><small style="color:#64748b">(1 mes por año laborado)</small></td>
        <td>${data.dias}</td>
        <td>${data.f.format(data.r_cesantias)}</td>
    </tr>
    <tr>
        <td>Intereses s/ Cesantías</td>
        <td>${data.f.format(data.r_cesantias)}<br><small style="color:#64748b">(12% anual sobre cesantías)</small></td>
        <td>${data.dias}</td>
        <td>${data.f.format(data.r_intCes)}</td>
    </tr>
    <tr>
        <td>Vacaciones</td>
        <td>${data.f.format(data.sueldo)}<br><small style="color:#64748b">(Sueldo base sin Aux. T)</small></td>
        <td>${data.dias}</td>
        <td>${data.f.format(data.r_vacas)}</td>
    </tr>
`;

document.getElementById('pdf_tabla_nom').innerHTML = `
    <tr>
        <td>Sueldo Periodo (${data.dias} días)</td>
        <td>${f.format((data.sueldo / 30) * data.dias)}</td>
    </tr>
    ${totalRecargosYExtras > 0 ? `<tr><td>Horas Extra y Recargos (Total)</td><td>${f.format(totalRecargosYExtras)}</td></tr>` : ''}
    ${indem > 0 ? `<tr><td>Indemnización Art. 64</td><td>${f.format(indem)}</td></tr>` : ''}
`;

document.getElementById('pdf_tabla_ded').innerHTML = `
    <tr><td>Seguridad Social (Salud)</td><td>4% sobre IBC</td><td style="color:red">-${data.f.format(data.r_salud)}</td></tr>
    <tr><td>Seguridad Social (Pensión)</td><td>4% sobre IBC</td><td style="color:red">-${data.f.format(data.r_pension)}</td></tr>
    ${data.r_cons > 0 ? `<tr><td>Consumos / Almuerzos</td><td>Deducción</td><td style="color:red">-${data.f.format(data.r_cons)}</td></tr>` : ''}
    ${data.r_otros > 0 ? `<tr><td>Otros Descuentos</td><td>Varios</td><td style="color:red">-${data.f.format(data.r_otros)}</td></tr>` : ''}
    <tr style="font-weight:bold"><td>TOTAL DEDUCCIONES</td><td></td><td style="color:red">-${data.f.format(data.total_deducciones)}</td></tr>
`;


    // 8. TOTAL NETO Y CIERRE 
   // 8. TOTAL NETO Y CIERRE (Sincronizado con la pantalla)
    const netoCerrado = data.neto_final_real; 
    
    document.getElementById('pdf_gran_total').innerText = data.f.format(netoCerrado);
    document.getElementById('pdf_letras').innerText = numeroALetras(Math.round(netoCerrado));
    document.getElementById('pdf_pazysalvo').style.display = document.getElementById('check_paz').checked ? 'block' : 'none';
    document.getElementById('p_fecha_actual').innerText = "Generado el: " + new Date().toLocaleDateString();
    // 9. FIRMAS
    document.getElementById('pdf_firma_emp').innerText = document.getElementById('conf_rep').value;
    document.getElementById('pdf_firma_trab').innerText = document.getElementById('emp_nombre').value;
    document.getElementById('pdf_cc_firma').innerText = document.getElementById('emp_cc').value;

    // 10. MOSTRAR RESULTADOS Y MODAL
    document.getElementById('pdf-preview-area').style.display = 'block';
    document.getElementById('modalCompartir').style.display = 'flex'; // ABRIR MINI VENTANA
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/* contrato obra labor*/

document.getElementById('emp_contrato').addEventListener('change', function() {
    const grupoObra = document.getElementById('grupo_obra');
    
    // Si selecciona Obra o Labor, se muestra. Si no, se oculta y se limpia.
    if (this.value === "Obra-o-Labor") {
        grupoObra.style.display = 'block';
    } else {
        grupoObra.style.display = 'none';
        document.getElementById('nombre_obra').value = ""; 
    }
});

        function descargarPDF() {
            const element = document.getElementById('pdf-template');
            element.style.display = 'block';
            const opt = {
                margin: 0,
                filename: `LIQUIDACION_${document.getElementById('emp_nombre').value.toUpperCase()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 3 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
            setTimeout(() => { element.style.display = 'none'; }, 500);
        }

        actualizarTodo();

function compartirWhatsApp() {
    const nombre = document.getElementById('emp_nombre').value || "Trabajador";
    const total = document.getElementById('pdf_gran_total').innerText;
    const mensaje = `Hola, envío la liquidación laboral de ${nombre} por un valor neto de ${total}. Generado por LaboralPro.`;

    // Abre WhatsApp con el texto predefinido
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function compartirEmail() {
    const nombre = document.getElementById('emp_nombre').value || "Trabajador";
    const asunto = `Liquidación Laboral - ${nombre}`;
    const cuerpo = `Adjunto envío el resumen de la liquidación definitiva de contrato. Valor Neto: ${document.getElementById('pdf_gran_total').innerText}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

// BLOQUEO AUTOMÁTICO DE INDEMNIZACIÓN PARA APRENDICES
document.getElementById('emp_contrato').addEventListener('change', function() {
    const checkIndem = document.getElementById('check_indem');
    const inputDiasIndem = document.getElementById('dias_indem');
    
    if (this.value === "Aprendizaje") {
        // Desmarcar y deshabilitar
        checkIndem.checked = false;
        checkIndem.disabled = true;
        if(inputDiasIndem) inputDiasIndem.disabled = true;
        
        // Opcional: Cambiar el estilo para que se vea "apagado"
        checkIndem.parentElement.style.opacity = "0.5";
        checkIndem.parentElement.title = "No aplica para contratos de aprendizaje";
    } else {
        // Habilitar para los demás contratos
        checkIndem.disabled = false;
        if(inputDiasIndem) inputDiasIndem.disabled = false;
        checkIndem.parentElement.style.opacity = "1";
        checkIndem.parentElement.title = "";
    }
});

function cerrarModal() {
    const modal = document.getElementById('modalCompartir');
    if (modal) {
        modal.style.display = 'none';
    }
}


function numeroALetras(num) {
    const aLetras = (n) => {
        if (n === 0) return 'CERO';
        const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const especiales = { 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE', 16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE' };
        
        if (n < 10) return unidades[n];
        if (especiales[n]) return especiales[n];
        if (n < 100) {
            let u = n % 10;
            return decenas[Math.floor(n / 10)] + (u > 0 ? ' Y ' + unidades[u] : '');
        }
        if (n < 1000) {
            if (n === 100) return 'CIEN';
            let d = n % 100;
            return (n < 200 ? 'CIENTO' : unidades[Math.floor(n / 100)] + 'CIENTOS') + (d > 0 ? ' ' + aLetras(d) : '');
        }
        if (n < 1000000) {
            let m = Math.floor(n / 1000);
            let resto = n % 1000;
            let strM = m === 1 ? 'MIL' : aLetras(m) + ' MIL';
            return strM + (resto > 0 ? ' ' + aLetras(resto) : '');
        }
        if (n < 1000000000) {
            let mill = Math.floor(n / 1000000);
            let resto = n % 1000000;
            let strMill = mill === 1 ? 'UN MILLÓN' : aLetras(mill) + ' MILLONES';
            return strMill + (resto > 0 ? ' ' + aLetras(resto) : '');
        }
        return n.toString();
    };

    return `SON: ${aLetras(Math.floor(num))} PESOS M/CTE.`;
}


function actualizarInfoARL() {
    const nivel = document.getElementById('cfg_arl').value;
    const infoText = document.getElementById('arl_descripcion_dinamica');
    const card = document.getElementById('arl_card_interactive');
    const tag = document.getElementById('arl_tag');
    const icon = document.getElementById('arl_icon');
    
    const data = {
        "0.522": {
            desc: "<b>Riesgo Mínimo:</b> Labores administrativas, docencia y servicios de escritorio. Accidentabilidad extremadamente baja.",
            color: "#3b82f6",
            tag: "Nivel I - Administrativo"
        },
        "1.044": {
            desc: "<b>Riesgo Bajo:</b> Comercio al por menor, agricultura y centros comerciales. Cubre caídas y lesiones en ventas.",
            color: "#10b981",
            tag: "Nivel II - Comercial"
        },
        "2.436": {
            desc: "<b>Riesgo Medio:</b> Talleres mecánicos, carpintería y fábricas pequeñas. Protección contra herramientas industriales.",
            color: "#f59e0b",
            tag: "Nivel III - Operativo"
        },
        "4.350": {
            desc: "<b>Riesgo Alto:</b> Conductores de carga, transporte pesado y construcción. Cobertura en accidentes viales.",
            color: "#f97316",
            tag: "Nivel IV - Logística"
        },
        "6.960": {
            desc: "<b>Riesgo Máximo:</b> Trabajo en alturas, manejo de explosivos y minería. Protección extrema obligatoria.",
            color: "#ef4444",
            tag: "Nivel V - Peligrosidad"
        }
    };

    const current = data[nivel];
    
    // Aplicar cambios con transiciones suaves
    infoText.style.opacity = 0;
    setTimeout(() => {
        infoText.innerHTML = current.desc;
        infoText.style.opacity = 1;
        tag.innerText = current.tag;
        tag.style.background = current.color;
        icon.style.color = current.color;
        card.style.borderTop = `5px solid ${current.color}`;
    }, 200);
}

function confirmarNuevaLiquidacion() {
    // Usamos SweetAlert si lo tienes, o un confirm estándar
    if (confirm("¿Deseas iniciar una nueva liquidación? Se borrarán todos los datos actuales.")) {
        // Efecto visual de recarga
        document.body.style.opacity = "0.5";
        setTimeout(() => {
            location.reload();
        }, 300);
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', actualizarInfoARL);

/* loging pages */

/* =============================================
   LÓGICA DE ACCESO - LABORALPRO
   ============================================= */

// Definimos los accesos permitidos (Usuario: Contraseña)
const usuariosPermitidos = {
    "miguel": "ma2356",
    "contabilidad": "nomina123",
    "gerencia": "gerenciapro2026",
    "invitado": "invitado2026"
};

function validarAcceso() {
    // Referencias a elementos
    const userInput = document.getElementById('user');
    const passInput = document.getElementById('pass');
    const btnMain = document.querySelector('.btn-login-main');
    const errorMsg = document.getElementById('login-error');
    const card = document.querySelector('.login-card');

    // Limpiar espacios y convertir usuario a minúscula para evitar errores
    const user = userInput.value.trim().toLowerCase();
    const pass = passInput.value.trim();

    // Verificación
    if (usuariosPermitidos.hasOwnProperty(user) && usuariosPermitidos[user] === pass) {
        
        // --- EFECTO DE ÉXITO ANTES DE ENTRAR ---
        // Deshabilitar campos y cambiar botón a verde
        userInput.disabled = true;
        passInput.disabled = true;
        btnMain.disabled = true;
        btnMain.innerHTML = '<i class="fas fa-check-circle"></i> Acceso Verificado';
        btnMain.style.background = "#22c55e"; // Color Verde Éxito
        btnMain.style.color = "#ffffff";
        errorMsg.style.display = "none"; // Ocultar error si existía

        // Ocultar login con transición suave (0.8s después del éxito)
        setTimeout(() => {
            const overlay = document.getElementById('login-overlay');
            overlay.style.opacity = "0";
            overlay.style.visibility = "hidden"; // Ocultar completamente

            // Después de que la animación termine, quitar display totalmente
            setTimeout(() => {
                overlay.style.display = "none";
            }, 500); // 0.5s es la duración de la transición CSS
        }, 800);

    } else {
        // --- EFECTO DE ERROR ---
        // Mostrar error, reiniciar inputs y aplicar vibración
        errorMsg.style.display = "block";
        passInput.value = ""; // Limpiar contraseña por seguridad
        
        card.style.animation = "shake-pro 0.4s cubic-bezier(.36,.07,.19,.97) both";
        
        // Limpiar animación para que se pueda repetir
        setTimeout(() => { card.style.animation = ""; }, 400);
        passInput.focus(); // Volver a enfocar la contraseña
    }
}

/* --- FUNCIONALIDADES EXTRAS PARA USUARIO PRO --- */

// 1. Mostrar/Ocultar Contraseña
function togglePasswordVisibility() {
    const passInput = document.getElementById('pass');
    const eyeIcon = document.querySelector('.btn-toggle-pass i');
    
    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// 2. Detectar tecla Enter para iniciar sesión más rápido
document.addEventListener('DOMContentLoaded', () => {
    // Al pulsar Enter en el campo de contraseña
    document.getElementById('pass').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { validarAcceso(); }
    });
    // Al pulsar Enter en el campo de usuario (pasa a contraseña)
    document.getElementById('user').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { document.getElementById('pass').focus(); }
    });
});


function mostrarSoporte() {
    const submenu = document.getElementById('submenu-soporte');
    const link = document.getElementById('forgot-link');
    
    if (submenu.style.display === "block") {
        submenu.style.display = "none";
        link.innerText = "¿Olvidó sus credenciales?";
    } else {
        submenu.style.display = "block";
        link.innerText = "Cerrar ayuda";
        // Scroll automático suave hacia abajo para que se vea el submenú en móviles
        setTimeout(() => {
            submenu.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}