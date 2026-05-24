<template>
  <div class="min-h-screen bg-[#F5F8FA]">

    <!-- ══ BARRA SUPERIOR ════════════════════════════════════════════════════ -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">

        <!-- Toolbar -->
        <div class="flex items-center gap-3 py-3">
          <button
            class="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all border border-gray-200"
            @click="$router.back()"
          >
            <i class="pi pi-arrow-left text-sm"></i>
          </button>

          <div class="flex-1 min-w-0">
            <h1 class="text-[15px] font-bold text-gray-800 leading-tight">Historial Clínico</h1>
            <p class="text-xs text-gray-400 mt-0.5 truncate">
              {{ patientFullName }}
              <template v-if="record?.patient?.susCode">
                <span class="mx-1.5 text-gray-300">·</span>
                <span class="font-mono">SUS: {{ record.patient.susCode }}</span>
              </template>
            </p>
          </div>

          <template v-if="record">
            <Select
              v-if="canWrite && !record.archivedAt"
              v-model="currentState"
              :options="stateOptions"
              optionLabel="label"
              optionValue="value"
              class="w-44 hidden sm:flex"
              @change="handleStateChange"
            >
              <template #value="{ value }">
                <div v-if="value" class="flex items-center gap-2">
                  <span class="inline-block w-2 h-2 rounded-full" :class="stateDot(value)"></span>
                  <span class="text-sm capitalize">{{ value }}</span>
                </div>
              </template>
            </Select>

            <button
              class="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-[#1A3C5E] rounded-lg hover:bg-[#112B44] transition-colors disabled:opacity-60 shrink-0"
              :disabled="loadingPDF"
              @click="downloadPDF"
            >
              <i class="pi text-xs" :class="loadingPDF ? 'pi-spin pi-spinner' : 'pi-file-pdf'"></i>
              <span class="hidden sm:inline">{{ loadingPDF ? 'Generando...' : 'Exportar PDF' }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- ══ SKELETON ══════════════════════════════════════════════════════════ -->
    <div v-if="loading" class="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Skeleton v-for="n in 6" :key="n" height="5.5rem" class="rounded-xl" />
      </div>
      <Skeleton height="9rem" class="rounded-xl" />
      <Skeleton height="12rem" class="rounded-xl" />
      <Skeleton v-for="n in 4" :key="n" height="7rem" class="rounded-xl" />
    </div>

    <!-- ══ ERROR ══════════════════════════════════════════════════════════════ -->
    <div v-else-if="loadError" class="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
      <i class="pi pi-exclamation-circle text-5xl text-red-200 mb-4 block"></i>
      <p class="text-gray-500 text-sm mb-4">{{ loadError }}</p>
      <button class="text-[#1A3C5E] text-sm font-semibold hover:underline" @click="loadRecord">Reintentar</button>
    </div>

    <!-- ══ CONTENIDO ═════════════════════════════════════════════════════════ -->
    <div v-else-if="record" class="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-4">

      <!-- ── Stats ──────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-purple-50 flex items-center justify-center">
            <i class="pi pi-clipboard text-purple-600"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 leading-none">{{ record.diagnoses?.length ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Diagnósticos</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-red-50 flex items-center justify-center">
            <i class="pi pi-exclamation-triangle text-red-500"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 leading-none">{{ record.allergyHistory?.length ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Alergias</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
            <i class="pi pi-shield text-indigo-600"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 leading-none">{{ record.vaccines?.length ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Vacunas</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-teal-50 flex items-center justify-center">
            <i class="pi pi-heart-fill text-teal-600"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 leading-none">{{ record.vitalSigns?.length ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Signos vitales</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-10 h-10 shrink-0 rounded-lg bg-sky-50 flex items-center justify-center">
            <i class="pi pi-calendar text-sky-600"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-gray-800 leading-none">{{ record.medicalAppointments?.length ?? 0 }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Citas</p>
          </div>
        </div>

      </div>

      <!-- ── Datos del paciente ─────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        <!-- Cabecera con avatar + nombre + estado -->
        <div class="flex items-start gap-5 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#1A3C5E]/[0.03] to-transparent">
          <!-- Avatar -->
          <div class="shrink-0 w-16 h-16 rounded-2xl bg-[#1A3C5E]/10 flex items-center justify-center">
            <i class="pi pi-user text-[#1A3C5E] text-3xl"></i>
          </div>
          <!-- Nombre + meta -->
          <div class="flex-1 min-w-0 pt-0.5">
            <div class="flex flex-wrap items-center gap-2.5 mb-2">
              <h2 class="text-lg font-bold text-gray-900 leading-tight">{{ patientFullName }}</h2>
              <Tag :value="record.state" :severity="stateSeverity(record.state)" class="text-xs capitalize" />
            </div>
            <!-- Píldoras de meta-datos -->
            <div class="flex flex-wrap gap-2">
              <span v-if="record.patient?.susCode" class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A3C5E] bg-[#1A3C5E]/10 px-2.5 py-1 rounded-full">
                <i class="pi pi-id-card text-[10px]"></i>
                SUS: {{ record.patient.susCode }}
              </span>
              <span v-if="record.patient?.gender" class="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize">
                <i class="pi pi-user text-[10px]"></i>
                {{ record.patient.gender }}
              </span>
              <span v-if="calcAge(record.patient?.dateOfBirth)" class="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <i class="pi pi-calendar text-[10px]"></i>
                {{ calcAge(record.patient?.dateOfBirth) }}
              </span>
              <span v-if="record.patient?.healthCenter?.name" class="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <i class="pi pi-building text-[10px]"></i>
                {{ record.patient.healthCenter.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-5 space-y-5">
          <!-- Grid de datos personales -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            <div class="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <div class="w-8 h-8 shrink-0 rounded-lg bg-[#1A3C5E]/10 flex items-center justify-center mt-0.5">
                <i class="pi pi-calendar text-[#1A3C5E] text-xs"></i>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Fecha de nacimiento</p>
                <p class="text-sm font-semibold text-gray-800">{{ formatDOB(record.patient?.dateOfBirth) }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <div class="w-8 h-8 shrink-0 rounded-lg bg-[#1A3C5E]/10 flex items-center justify-center mt-0.5">
                <i class="pi pi-clock text-[#1A3C5E] text-xs"></i>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Edad</p>
                <p class="text-sm font-semibold text-gray-800">{{ calcAge(record.patient?.dateOfBirth) || "—" }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <div class="w-8 h-8 shrink-0 rounded-lg bg-[#1A3C5E]/10 flex items-center justify-center mt-0.5">
                <i class="pi pi-phone text-[#1A3C5E] text-xs"></i>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Teléfono</p>
                <p class="text-sm font-semibold text-gray-800">{{ record.patient?.contactInfo?.phone || "—" }}</p>
              </div>
            </div>

          </div>

          <!-- Alergias y condiciones -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Alergias -->
            <div class="rounded-xl border border-red-100 overflow-hidden">
              <div class="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border-b border-red-100">
                <div class="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center shrink-0">
                  <i class="pi pi-exclamation-triangle text-red-500 text-[10px]"></i>
                </div>
                <p class="text-xs font-bold text-red-700">Alergias conocidas</p>
                <span class="ml-auto text-[10px] font-bold text-red-400 bg-red-100 px-1.5 py-0.5 rounded-full">
                  {{ record.patient?.allergies?.filter(Boolean).length || 0 }}
                </span>
              </div>
              <div class="px-3.5 py-3">
                <div v-if="record.patient?.allergies?.filter(Boolean).length" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="a in record.patient.allergies.filter(Boolean)" :key="a"
                    class="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-medium"
                  >
                    <i class="pi pi-exclamation-triangle text-[10px]"></i>
                    {{ a }}
                  </span>
                </div>
                <p v-else class="text-xs text-gray-400 italic py-0.5">Sin alergias registradas</p>
              </div>
            </div>

            <!-- Condiciones -->
            <div class="rounded-xl border border-blue-100 overflow-hidden">
              <div class="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 border-b border-blue-100">
                <div class="w-5 h-5 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                  <i class="pi pi-heart text-blue-500 text-[10px]"></i>
                </div>
                <p class="text-xs font-bold text-blue-700">Condiciones previas</p>
                <span class="ml-auto text-[10px] font-bold text-blue-400 bg-blue-100 px-1.5 py-0.5 rounded-full">
                  {{ record.patient?.medicalConditions?.filter(Boolean).length || 0 }}
                </span>
              </div>
              <div class="px-3.5 py-3">
                <div v-if="record.patient?.medicalConditions?.filter(Boolean).length" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="c in record.patient.medicalConditions.filter(Boolean)" :key="c"
                    class="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium"
                  >
                    {{ c }}
                  </span>
                </div>
                <p v-else class="text-xs text-gray-400 italic py-0.5">Sin condiciones registradas</p>
              </div>
            </div>
          </div>

          <!-- Contacto de emergencia -->
          <div v-if="record.patient?.emergencyContact?.name" class="rounded-xl border border-amber-200 overflow-hidden">
            <div class="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 border-b border-amber-100">
              <div class="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                <i class="pi pi-phone text-amber-500 text-[10px]"></i>
              </div>
              <p class="text-xs font-bold text-amber-700">Contacto de emergencia</p>
            </div>
            <div class="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Nombre</p>
                <p class="text-sm font-semibold text-gray-800">{{ record.patient.emergencyContact.name }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Parentesco</p>
                <p class="text-sm text-gray-700">{{ record.patient.emergencyContact.relationship || "—" }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Teléfono</p>
                <p class="text-sm font-mono font-semibold text-gray-800">{{ record.patient.emergencyContact.phone || "—" }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Signos vitales ──────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-teal-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Signos vitales</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ record.vitalSigns?.length ?? 0 }}</span>
          </div>
          <button
            v-if="canWrite && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-[#1A3C5E] border border-[#1A3C5E]/30 px-3 py-1.5 rounded-lg hover:bg-[#1A3C5E] hover:text-white transition-all"
            @click="openAdd('vitalSigns')"
          >
            <i class="pi pi-plus text-[10px]"></i> Registrar
          </button>
        </div>

        <template v-if="record.vitalSigns?.length">
          <!-- Última toma -->
          <div class="px-5 pt-4 pb-2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Última toma registrada — {{ formatDate(latestVS.date) }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

              <!-- Presión Arterial -->
              <div class="rounded-xl border p-3.5 text-center flex flex-col" :class="vsCardClass(vsAlert(latestVS,'bp'))">
                <div class="mb-2">
                  <p class="text-sm font-black text-gray-600 leading-none">PA</p>
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5 leading-none">Presión Arterial</p>
                </div>
                <p class="text-xl font-bold leading-none flex-1 flex items-center justify-center" :class="vsTextClass(vsAlert(latestVS,'bp'))">{{ bpText(latestVS) ?? "—" }}</p>
                <div class="mt-2">
                  <p class="text-[10px] font-semibold text-gray-500">mmHg</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">milímetros de mercurio</p>
                  <p class="text-[10px] text-gray-300 mt-0.5">Ref: 90–120 / 60–80</p>
                </div>
                <i v-if="vsAlert(latestVS,'bp')" class="pi text-[10px] mt-1 block" :class="vsIconClass(vsAlert(latestVS,'bp'))"></i>
              </div>

              <!-- Frecuencia Cardíaca -->
              <div class="rounded-xl border p-3.5 text-center flex flex-col" :class="vsCardClass(vsAlert(latestVS,'hr'))">
                <div class="mb-2">
                  <p class="text-sm font-black text-gray-600 leading-none">FC</p>
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5 leading-none">Frec. Cardíaca</p>
                </div>
                <p class="text-xl font-bold leading-none flex-1 flex items-center justify-center" :class="vsTextClass(vsAlert(latestVS,'hr'))">{{ latestVS.heartRate ?? "—" }}</p>
                <div class="mt-2">
                  <p class="text-[10px] font-semibold text-gray-500">lpm</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">latidos por minuto</p>
                  <p class="text-[10px] text-gray-300 mt-0.5">Ref: 60–100 lpm</p>
                </div>
                <i v-if="vsAlert(latestVS,'hr')" class="pi text-[10px] mt-1 block" :class="vsIconClass(vsAlert(latestVS,'hr'))"></i>
              </div>

              <!-- Temperatura -->
              <div class="rounded-xl border p-3.5 text-center flex flex-col" :class="vsCardClass(vsAlert(latestVS,'temp'))">
                <div class="mb-2">
                  <p class="text-sm font-black text-gray-600 leading-none">Temp.</p>
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5 leading-none">Temperatura</p>
                </div>
                <p class="text-xl font-bold leading-none flex-1 flex items-center justify-center" :class="vsTextClass(vsAlert(latestVS,'temp'))">{{ latestVS.temperature ?? "—" }}</p>
                <div class="mt-2">
                  <p class="text-[10px] font-semibold text-gray-500">°C</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">grados Celsius</p>
                  <p class="text-[10px] text-gray-300 mt-0.5">Ref: 36.0–37.5 °C</p>
                </div>
                <i v-if="vsAlert(latestVS,'temp')" class="pi text-[10px] mt-1 block" :class="vsIconClass(vsAlert(latestVS,'temp'))"></i>
              </div>

              <!-- Saturación de Oxígeno -->
              <div class="rounded-xl border p-3.5 text-center flex flex-col" :class="vsCardClass(vsAlert(latestVS,'o2'))">
                <div class="mb-2">
                  <p class="text-sm font-black text-gray-600 leading-none">SpO₂</p>
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5 leading-none">Saturación O₂</p>
                </div>
                <p class="text-xl font-bold leading-none flex-1 flex items-center justify-center" :class="vsTextClass(vsAlert(latestVS,'o2'))">{{ latestVS.oxygenSaturation ?? "—" }}</p>
                <div class="mt-2">
                  <p class="text-[10px] font-semibold text-gray-500">%</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">porcentaje de saturación</p>
                  <p class="text-[10px] text-gray-300 mt-0.5">Ref: ≥ 95 %</p>
                </div>
                <i v-if="vsAlert(latestVS,'o2')" class="pi text-[10px] mt-1 block" :class="vsIconClass(vsAlert(latestVS,'o2'))"></i>
              </div>

              <!-- Peso -->
              <div class="rounded-xl border border-gray-100 p-3.5 text-center flex flex-col bg-gray-50">
                <div class="mb-2">
                  <p class="text-sm font-black text-gray-600 leading-none">Peso</p>
                  <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-0.5 leading-none">Corporal</p>
                </div>
                <p class="text-xl font-bold text-gray-800 leading-none flex-1 flex items-center justify-center">{{ latestVS.weight ?? "—" }}</p>
                <div class="mt-2">
                  <p class="text-[10px] font-semibold text-gray-500">kg</p>
                  <p class="text-[10px] text-gray-400 mt-0.5">kilogramos</p>
                  <p class="text-[10px] text-gray-300 mt-0.5">&nbsp;</p>
                </div>
              </div>

            </div>
            <p v-if="latestVS.notes" class="mt-3 text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">
              <i class="pi pi-comment text-[10px] mr-1.5"></i>{{ latestVS.notes }}
            </p>
          </div>

          <!-- Historial de tomas -->
          <div v-if="sortedVS.length > 1" class="border-t border-gray-100 px-5 py-3">
            <details>
              <summary class="cursor-pointer text-xs font-semibold text-[#1A3C5E] hover:text-[#112B44] select-none flex items-center gap-1.5">
                <i class="pi pi-history text-[10px]"></i>
                Ver historial completo ({{ sortedVS.length - 1 }} toma{{ sortedVS.length > 2 ? "s" : "" }} anterior{{ sortedVS.length > 2 ? "es" : "" }})
              </summary>
              <div class="mt-3 overflow-x-auto">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr class="bg-gray-50 border-y border-gray-100">
                      <th class="text-left px-3 py-2 whitespace-nowrap">
                        <p class="text-xs font-bold text-gray-600 uppercase tracking-wide">Fecha</p>
                      </th>
                      <th class="text-left px-3 py-2 whitespace-nowrap">
                        <p class="text-xs font-black text-gray-700 leading-none">PA</p>
                        <p class="text-xs text-gray-500 mt-0.5">Presión Arterial</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">mmHg · milímetros de mercurio</p>
                        <p class="text-[10px] text-gray-300 mt-0.5">Ref: 90–120 / 60–80</p>
                      </th>
                      <th class="text-left px-3 py-2 whitespace-nowrap">
                        <p class="text-xs font-black text-gray-700 leading-none">FC</p>
                        <p class="text-xs text-gray-500 mt-0.5">Frec. Cardíaca</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">lpm · latidos por minuto</p>
                        <p class="text-[10px] text-gray-300 mt-0.5">Ref: 60–100 lpm</p>
                      </th>
                      <th class="text-left px-3 py-2 whitespace-nowrap">
                        <p class="text-xs font-black text-gray-700 leading-none">Temp.</p>
                        <p class="text-xs text-gray-500 mt-0.5">Temperatura</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">°C · grados Celsius</p>
                        <p class="text-[10px] text-gray-300 mt-0.5">Ref: 36.0–37.5 °C</p>
                      </th>
                      <th class="text-left px-3 py-2 whitespace-nowrap">
                        <p class="text-xs font-black text-gray-700 leading-none">SpO₂</p>
                        <p class="text-xs text-gray-500 mt-0.5">Saturación de Oxígeno</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">% · porcentaje de saturación</p>
                        <p class="text-[10px] text-gray-300 mt-0.5">Ref: ≥ 95 %</p>
                      </th>
                      <th class="text-left px-3 py-2 whitespace-nowrap">
                        <p class="text-xs font-black text-gray-700 leading-none">Peso</p>
                        <p class="text-xs text-gray-500 mt-0.5">Peso corporal</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">kg · kilogramos</p>
                        <p class="text-[10px] text-gray-300 mt-0.5">&nbsp;</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <tr v-for="vs in sortedVS.slice(1)" :key="vs._id" class="hover:bg-gray-50/70 transition-colors">
                      <td class="px-3 py-2.5 font-medium text-gray-600 whitespace-nowrap">{{ formatDate(vs.date) }}</td>
                      <td class="px-3 py-2.5 text-gray-700 font-semibold">{{ bpText(vs) ?? "—" }}</td>
                      <td class="px-3 py-2.5 text-gray-700">{{ vs.heartRate ?? "—" }}</td>
                      <td class="px-3 py-2.5 text-gray-700">{{ vs.temperature ?? "—" }}</td>
                      <td class="px-3 py-2.5 text-gray-700">{{ vs.oxygenSaturation ?? "—" }}</td>
                      <td class="px-3 py-2.5 text-gray-700">{{ vs.weight ?? "—" }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </template>

        <div v-else class="px-5 py-10 text-center">
          <i class="pi pi-heart-fill text-3xl text-gray-100 mb-3 block"></i>
          <p class="text-sm text-gray-400">Sin signos vitales registrados</p>
        </div>
      </div>

      <!-- ── Gráficas de evolución ────────────────────────────────────────── -->
      <div v-if="sortedVS.length > 0" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
          <div class="w-1 h-5 rounded-sm bg-[#2A7C6F]"></div>
          <h3 class="text-sm font-semibold text-gray-800">Evolución clínica</h3>
          <span class="text-xs text-gray-400 ml-1">— {{ sortedVS.length }} toma{{ sortedVS.length !== 1 ? 's' : '' }}</span>
        </div>

        <!-- Con menos de 2 tomas no hay tendencia que graficar -->
        <div v-if="sortedVS.length < 2" class="px-5 py-8 text-center">
          <i class="pi pi-chart-line text-3xl text-gray-200 mb-3 block"></i>
          <p class="text-sm text-gray-500 font-medium">Solo hay 1 toma registrada.</p>
          <p class="text-xs text-gray-400 mt-1">Registra una segunda toma para ver la evolución en el tiempo.</p>
        </div>

        <!-- Gráficas: >= 2 tomas -->
        <div v-else class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-if="hasBP">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Presión arterial (mmHg)</p>
            <canvas ref="bpChartRef" height="130"></canvas>
          </div>
          <div v-if="hasO2">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Saturación O₂ (%)</p>
            <canvas ref="o2ChartRef" height="130"></canvas>
          </div>
          <div v-if="hasWeight">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Peso (kg)</p>
            <canvas ref="weightChartRef" height="130"></canvas>
          </div>
          <div v-if="hasFCChart">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Frecuencia cardíaca (lpm)</p>
            <canvas ref="heartRateChartRef" height="130"></canvas>
          </div>
          <div v-if="hasTempChart">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Temperatura (°C)</p>
            <canvas ref="tempChartRef" height="130"></canvas>
          </div>
          <div v-if="!hasAnyChart" class="col-span-2 py-8 text-center">
            <i class="pi pi-chart-line text-3xl text-gray-200 mb-3 block"></i>
            <p class="text-sm text-gray-400">Todos los campos están vacíos en estas tomas.</p>
            <p class="text-xs text-gray-300 mt-1">Completa los valores de PA, SpO₂, Peso, FC o Temperatura al registrar.</p>
          </div>
        </div>
      </div>

      <!-- ── Diagnósticos ──────────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-purple-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Diagnósticos</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ record.diagnoses?.length ?? 0 }}</span>
          </div>
          <button v-if="canWrite && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
            @click="openAdd('diagnosis')"
          >
            <i class="pi pi-plus text-[10px]"></i> Agregar
          </button>
        </div>

        <template v-if="record.diagnoses?.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">CIE-10</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Médico</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Registrado por</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="d in record.diagnoses" :key="d._id" class="hover:bg-gray-50/60 transition-colors">
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(d.date) }}</td>
                  <td class="px-4 py-3">
                    <span v-if="d.code" class="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-mono">{{ d.code }}</span>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 max-w-xs">
                    <p class="text-sm font-medium text-gray-800 line-clamp-2">{{ d.description }}</p>
                    <p v-if="d.notes" class="text-xs text-gray-500 italic mt-0.5 line-clamp-1">{{ d.notes }}</p>
                    <button
                      v-if="d.description?.length > 80 || d.notes"
                      class="text-xs text-purple-600 hover:text-purple-800 hover:underline mt-0.5"
                      @click.stop="openDetail('Diagnóstico', [d.description, d.notes ? 'Observaciones:\n' + d.notes : ''].filter(Boolean).join('\n\n'))"
                    >ver más</button>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                    <template v-if="d.doctor?.name">Dr. {{ d.doctor.name }}<br v-if="d.doctor.specialty"><span class="text-gray-400">{{ d.doctor.specialty }}</span></template>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">{{ userFullName(d.createdBy) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin diagnósticos registrados</p>
        </div>
      </div>

      <!-- ── Alergias ─────────────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-red-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Historial de alergias</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ record.allergyHistory?.length ?? 0 }}</span>
          </div>
          <button v-if="canWrite && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-red-700 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            @click="openAdd('allergy')"
          >
            <i class="pi pi-plus text-[10px]"></i> Agregar
          </button>
        </div>

        <template v-if="record.allergyHistory?.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sustancia</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reacción</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Severidad</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="a in record.allergyHistory" :key="a._id" class="hover:bg-gray-50/60 transition-colors">
                  <td class="px-4 py-3 font-semibold text-gray-800">{{ a.substance }}</td>
                  <td class="px-4 py-3 max-w-xs">
                    <p class="text-gray-600 text-xs line-clamp-2">{{ a.reaction }}</p>
                    <button
                      v-if="a.reaction?.length > 80"
                      class="text-xs text-red-500 hover:text-red-700 hover:underline mt-0.5"
                      @click.stop="openDetail('Reacción alérgica', a.reaction)"
                    >ver más</button>
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="a.severity" class="text-xs px-2.5 py-1 rounded-full font-semibold border" :class="severityBadge(a.severity)">
                      {{ a.severity }}
                    </span>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap hidden sm:table-cell">{{ formatDate(a.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin alergias registradas</p>
        </div>
      </div>

      <!-- ── Tratamientos previos ─────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-amber-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Tratamientos previos</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ record.previousTreatments?.length ?? 0 }}</span>
          </div>
          <button v-if="canWrite && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
            @click="openAdd('treatment')"
          >
            <i class="pi pi-plus text-[10px]"></i> Agregar
          </button>
        </div>

        <template v-if="record.previousTreatments?.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tratamiento</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Tipo</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Desde</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Hasta</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="t in record.previousTreatments" :key="t._id" class="hover:bg-gray-50/60 transition-colors">
                  <td class="px-4 py-3 max-w-xs">
                    <p class="text-sm font-semibold text-gray-800 line-clamp-2">{{ t.treatment }}</p>
                    <button
                      v-if="t.treatment?.length > 80"
                      class="text-xs text-amber-600 hover:text-amber-800 hover:underline mt-0.5"
                      @click.stop="openDetail('Tratamiento', t.treatment)"
                    >ver más</button>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                    <span v-if="t.type" class="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">{{ t.type }}</span>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap hidden sm:table-cell">{{ formatDate(t.from) }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap hidden sm:table-cell">{{ formatDate(t.to) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin tratamientos previos registrados</p>
        </div>
      </div>

      <!-- ── Vacunas ──────────────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-indigo-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Registro de vacunación</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ record.vaccines?.length ?? 0 }}</span>
          </div>
          <button v-if="canWrite && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
            @click="openAdd('vaccine')"
          >
            <i class="pi pi-plus text-[10px]"></i> Registrar
          </button>
        </div>

        <template v-if="record.vaccines?.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vacuna</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Dosis</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Lote</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Aplicado por</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="v in record.vaccines" :key="v._id" class="hover:bg-gray-50/60 transition-colors">
                  <td class="px-4 py-3 max-w-xs">
                    <p class="font-semibold text-gray-800">{{ v.name }}</p>
                    <p v-if="v.notes" class="text-xs text-gray-500 italic mt-0.5 line-clamp-1">{{ v.notes }}</p>
                    <button
                      v-if="v.notes?.length > 60"
                      class="text-xs text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5"
                      @click.stop="openDetail('Observaciones de vacuna', v.notes)"
                    >ver más</button>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{{ v.doseNumber || "—" }}</td>
                  <td class="px-4 py-3 text-xs font-mono text-gray-400 hidden md:table-cell">{{ v.lot || "—" }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(v.date) }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{{ v.appliedBy || "—" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin vacunas registradas</p>
        </div>
      </div>

      <!-- ── Observaciones clínicas ─────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-sky-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Observaciones clínicas</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ record.observations?.length ?? 0 }}</span>
          </div>
          <button v-if="canWrite && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all"
            @click="openAdd('observation')"
          >
            <i class="pi pi-plus text-[10px]"></i> Agregar
          </button>
        </div>

        <div v-if="record.observations?.length" class="divide-y divide-gray-100">
          <div v-for="o in record.observations" :key="o._id" class="px-5 py-4 hover:bg-gray-50/40 transition-colors">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xs font-medium text-gray-400">{{ formatDate(o.date) }}</span>
              <span v-if="o.createdBy" class="text-xs text-gray-400">— {{ userFullName(o.createdBy) }}</span>
              <span v-if="o.doctor?.name" class="ml-auto text-xs text-indigo-500 font-medium">Dr. {{ o.doctor.name }}</span>
            </div>
            <p class="text-sm text-gray-700 leading-relaxed line-clamp-3">{{ o.note }}</p>
            <button
              v-if="o.note?.length > 160"
              class="text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1"
              @click="openDetail('Observación clínica', o.note)"
            >ver más</button>
          </div>
        </div>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin observaciones registradas</p>
        </div>
      </div>

      <!-- ── Citas médicas ────────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
          <div class="w-1 h-5 rounded-sm bg-[#1A3C5E]"></div>
          <h3 class="text-sm font-semibold text-gray-800">Citas médicas vinculadas</h3>
          <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ sortedApts.length }}</span>
        </div>

        <template v-if="sortedApts.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Hora</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Servicio</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="apt in displayedApts" :key="apt._id" class="hover:bg-gray-50/60 transition-colors">
                  <td class="px-4 py-3 font-medium text-gray-700 whitespace-nowrap text-xs">{{ formatDate(apt.date) }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap hidden sm:table-cell">{{ apt.time || "—" }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600">{{ apt.services?.[0]?.name || "—" }}</td>
                  <td class="px-4 py-3">
                    <Tag :value="apt.state" :severity="aptSeverity(apt.state)" class="text-xs" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="sortedApts.length > APT_PREVIEW" class="px-5 py-3 border-t border-gray-100">
            <button
              class="text-xs text-[#1A3C5E] font-semibold hover:underline"
              @click="showAllApts = !showAllApts"
            >
              {{ showAllApts ? "Ver menos" : `Ver todas las citas (${sortedApts.length})` }}
            </button>
          </div>
        </template>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin citas médicas vinculadas</p>
        </div>
      </div>

      <!-- ── Recetas médicas ─────────────────────────────────────────────── -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div class="flex items-center gap-2.5">
            <div class="w-1 h-5 rounded-sm bg-violet-500"></div>
            <h3 class="text-sm font-semibold text-gray-800">Recetas médicas</h3>
            <span class="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{{ prescriptions.length }}</span>
          </div>
          <button
            v-if="canCreatePrescription && !record.archivedAt"
            class="flex items-center gap-1.5 text-xs font-semibold text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
            @click="openCreateRx"
          >
            <i class="pi pi-plus text-[10px]"></i> Generar receta
          </button>
        </div>

        <div v-if="loadingRx" class="px-5 py-4 space-y-2">
          <Skeleton height="2rem" />
          <Skeleton height="2rem" />
        </div>
        <template v-else-if="prescriptions.length">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Médico</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell text-center">Ítems</th>
                  <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="rx in prescriptions" :key="rx._id" class="hover:bg-gray-50/60 transition-colors">
                  <td class="px-4 py-3 font-mono font-bold text-sky-700 text-xs">{{ rx.code }}</td>
                  <td class="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{{ formatDate(rx.date) }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600 hidden sm:table-cell">{{ rx.doctor?.name ?? '—' }}</td>
                  <td class="px-4 py-3 text-xs text-center text-gray-600 hidden sm:table-cell">{{ rx.items?.length ?? 0 }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-0.5 text-xs rounded-full font-medium border"
                      :class="{
                        'bg-yellow-50 text-yellow-700 border-yellow-200': rx.status === 'Pendiente',
                        'bg-blue-50 text-blue-700 border-blue-200': rx.status === 'Parcial',
                        'bg-green-50 text-green-700 border-green-200': rx.status === 'Despachada',
                      }"
                    >{{ rx.status }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-4">
                      <button
                        class="text-violet-500 hover:text-violet-700 transition"
                        title="Vista previa / imprimir"
                        @click="printRx(rx)"
                      >
                        <i class="pi pi-print text-base"></i>
                      </button>
                      <button
                        v-if="canCreatePrescription && rx.status === 'Pendiente'"
                        class="text-red-400 hover:text-red-600 transition"
                        title="Eliminar receta"
                        @click="deleteRx(rx)"
                      >
                        <i class="pi pi-trash text-base"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm text-gray-400">Sin recetas médicas registradas</p>
        </div>
      </div>

      <!-- Espaciado final -->
      <div class="h-4"></div>
    </div>

    <ModalAddSubdoc />

    <!-- ── Dialog: ver texto completo ───────────────────────────────────────── -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="detailDialogTitle"
      modal
      :style="{ width: '95vw', maxWidth: '520px' }"
    >
      <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ detailDialogText }}</p>
    </Dialog>

    <!-- ── Modal: Generar receta ───────────────────────────────────────────── -->
    <Dialog
      v-model:visible="showRxModal"
      header="Generar receta médica"
      modal
      :style="{ width: '95vw', maxWidth: '620px' }"
    >
      <div class="space-y-4 pt-2">
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-semibold text-gray-700">Medicamentos</p>
            <button
              class="text-xs text-violet-700 font-semibold hover:underline flex items-center gap-1"
              @click="addRxItem"
            >
              <i class="pi pi-plus text-[10px]"></i> Agregar
            </button>
          </div>

          <div v-if="loadingStock" class="py-4 text-center text-sm text-gray-400">
            <i class="pi pi-spin pi-spinner mr-2"></i>Cargando medicamentos disponibles...
          </div>
          <div v-else-if="stockOptions.length === 0" class="py-4 text-center text-sm text-red-500">
            No hay medicamentos disponibles en su centro de salud.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, idx) in rxForm.items"
              :key="idx"
              class="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
            >
              <!-- Cabecera del ítem: número + botón quitar -->
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-gray-500">Medicamento {{ idx + 1 }}</span>
                <button
                  v-if="rxForm.items.length > 1"
                  class="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition"
                  @click="removeRxItem(idx)"
                >
                  <i class="pi pi-trash text-xs"></i> Quitar
                </button>
              </div>

              <!-- Selector de medicamento -->
              <div>
                <label class="text-xs font-medium text-gray-600 mb-1 block">Medicamento *</label>
                <Select
                  v-model="item.stock"
                  :options="stockOptions"
                  optionLabel="name"
                  optionValue="_id"
                  class="w-full"
                  placeholder="Seleccionar medicamento"
                  filter
                />
                <p v-if="item.stock" class="text-xs text-gray-400 mt-0.5">
                  Disponible: {{ stockOptions.find(s => s._id === item.stock)?.availableQuantity ?? '?' }}
                  {{ stockOptions.find(s => s._id === item.stock)?.unit }}
                </p>
              </div>

              <!-- Campos: dosis, frecuencia, duración, cantidad -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label class="text-xs font-medium text-gray-600 mb-1 block">Dosis *</label>
                  <input v-model="item.dose" type="text" placeholder="Ej: 500mg" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-600 mb-1 block">Frecuencia (horas) *</label>
                  <div class="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      v-model.number="item.frequency"
                      type="number"
                      min="1"
                      placeholder="8"
                      class="flex-1 min-w-0 px-2 py-1.5 text-sm outline-none bg-white"
                    />
                    <span class="px-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200 shrink-0">h</span>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-600 mb-1 block">Duración (días) *</label>
                  <div class="flex items-center border border-gray-300 rounded overflow-hidden">
                    <input
                      v-model.number="item.duration"
                      type="number"
                      min="1"
                      placeholder="7"
                      class="flex-1 min-w-0 px-2 py-1.5 text-sm outline-none bg-white"
                    />
                    <span class="px-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200 shrink-0">días</span>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-600 mb-1 block">Cantidad *</label>
                  <input v-model.number="item.quantityToDispense" type="number" :min="1" class="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Notas adicionales</label>
          <textarea
            v-model="rxForm.notes"
            rows="2"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            placeholder="Indicaciones adicionales para el farmacéutico..."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <button
            class="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            @click="showRxModal = false"
          >Cancelar</button>
          <button
            class="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition flex items-center gap-2 disabled:opacity-60"
            :disabled="savingRx"
            @click="submitRx"
          >
            <i class="pi pi-spin pi-spinner text-xs" v-if="savingRx"></i>
            <i class="pi pi-check text-xs" v-else></i>
            Generar receta
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, inject } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import Tag from "primevue/tag";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import { Chart, registerables } from "chart.js";
import { getRecordById, updateRecordState, downloadHealthRecordPDF } from "@/modules/medical-record/api/recordsApi";
import { useRecordStore } from "@/modules/medical-record/store/recordStore";
import { useUserStore } from "@/stores/user";
import ModalAddSubdoc from "@/modules/medical-record/components/ModalAddSubdoc.vue";
import Dialog from "primevue/dialog";
import Swal from "sweetalert2";
import PrescriptionApi from "@/api/prescriptionApi";
import StockApi from "@/api/stockApi";
import { generatePrescriptionPdf } from "@/helpers/prescriptionPdf";

Chart.register(...registerables);

// ── Setup ─────────────────────────────────────────────────────────────────────
const route       = useRoute();
const toast       = inject("toast");
const recordStore = useRecordStore();
const { openSubdocModal } = recordStore;
const userStore   = useUserStore();
const { user }    = storeToRefs(userStore);

const record      = ref(null);
const loading     = ref(false);
const loadError   = ref(null);
const loadingPDF  = ref(false);
const showAllApts = ref(false);
const APT_PREVIEW = 5;
const currentState = ref(null);

const canWrite = computed(() => user.value?.admin || user.value?.branchManager || user.value?.doctor);
const canCreatePrescription = computed(() => user.value?.doctor || user.value?.admin);

// ── Recetas ────────────────────────────────────────────────────────────────────
const prescriptions  = ref([]);
const loadingRx      = ref(false);
const savingRx       = ref(false);
const showRxModal    = ref(false);
const stockOptions   = ref([]);
const loadingStock   = ref(false);
const rxForm         = ref({ items: [], notes: "" });

const loadPrescriptions = async () => {
  const patientId = record.value?.patient?._id;
  if (!patientId) return;
  loadingRx.value = true;
  try {
    const data = await PrescriptionApi.getByPatient(patientId);
    prescriptions.value = data.data;
  } catch {
    prescriptions.value = [];
  } finally {
    loadingRx.value = false;
  }
};

const openCreateRx = async () => {
  rxForm.value = { items: [{ stock: null, dose: "", frequency: null, duration: null, quantityToDispense: 1 }], notes: "" };
  showRxModal.value = true;
  loadingStock.value = true;
  try {
    const { data } = await StockApi.getAvailable();
    stockOptions.value = data;
  } catch {
    stockOptions.value = [];
  } finally {
    loadingStock.value = false;
  }
};

const addRxItem = () => {
  rxForm.value.items.push({ stock: null, dose: "", frequency: null, duration: null, quantityToDispense: 1 });
};

const removeRxItem = (idx) => {
  rxForm.value.items.splice(idx, 1);
};

const submitRx = async () => {
  const validItems = rxForm.value.items.filter(
    (i) => i.stock && i.dose && i.frequency >= 1 && i.duration >= 1 && i.quantityToDispense > 0
  );
  if (validItems.length === 0) {
    toast?.open({ message: "Completa todos los campos de cada medicamento (dosis, horas, días y cantidad)", type: "warning" });
    return;
  }
  savingRx.value = true;
  try {
    await PrescriptionApi.createPrescription({
      patient: record.value.patient._id,
      items: validItems,
      notes: rxForm.value.notes,
    });
    toast?.open({ message: "Receta generada correctamente", type: "success" });
    showRxModal.value = false;
    await loadPrescriptions();
  } catch (error) {
    const msg = error?.response?.data?.msg ?? "Error al generar receta";
    toast?.open({ message: msg, type: "error" });
  } finally {
    savingRx.value = false;
  }
};

const printRx = async (rx) => {
  try {
    const { data } = await PrescriptionApi.getPrescriptionById(rx._id);
    await generatePrescriptionPdf(data);
  } catch {
    toast?.open({ message: "Error al generar PDF de la receta", type: "error" });
  }
};

// ── Ver detalle completo de texto largo ───────────────────────────────────────
const showDetailDialog   = ref(false);
const detailDialogTitle  = ref("");
const detailDialogText   = ref("");

const openDetail = (title, text) => {
  if (!text) return;
  detailDialogTitle.value = title;
  detailDialogText.value  = text;
  showDetailDialog.value  = true;
};

const deleteRx = async (rx) => {
  const result = await Swal.fire({
    title: `¿Eliminar receta ${rx.code}?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    buttonsStyling: false,
    customClass: {
      confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition",
      cancelButton: "bg-gray-300 text-gray-800 px-4 py-2 rounded ml-2",
    },
  });
  if (!result.isConfirmed) return;
  try {
    await PrescriptionApi.deletePrescription(rx._id);
    toast?.open({ message: "Receta eliminada", type: "success" });
    await loadPrescriptions();
  } catch (error) {
    const msg = error?.response?.data?.msg ?? "Error al eliminar receta";
    toast?.open({ message: msg, type: "error" });
  }
};

// Refs de canvas para gráficas
const bpChartRef        = ref(null);
const o2ChartRef        = ref(null);
const weightChartRef    = ref(null);
const heartRateChartRef = ref(null);
const tempChartRef      = ref(null);
let chartInstances = [];

// ── Cargar historial ──────────────────────────────────────────────────────────
const loadRecord = async () => {
  loading.value   = true;
  loadError.value = null;
  try {
    record.value       = await getRecordById(route.params.id);
    currentState.value = record.value?.state ?? null;
  } catch (e) {
    loadError.value = e?.response?.data?.message ?? "Error al cargar el historial.";
  } finally {
    loading.value = false;   // primero quitar el skeleton para que los canvas monten
    await nextTick();        // esperar a que Vue renderice los canvas
    buildCharts();           // ahora los refs están en el DOM
  }
};

onMounted(async () => {
  await userStore.getUser();
  await loadRecord();
  await loadPrescriptions();
});

// Recarga solo si el modal cerró después de guardar (no al cancelar)
watch(
  () => recordStore.visibleSubdoc,
  async (open) => { if (!open && record.value && recordStore.subdocSaved) await loadRecord(); }
);

// ── Computeds ─────────────────────────────────────────────────────────────────
const patientFullName = computed(() => {
  const p = record.value?.patient;
  return p ? [p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(" ") : "—";
});

const sortedVS = computed(() =>
  [...(record.value?.vitalSigns ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date))
);
const latestVS = computed(() => sortedVS.value[0] ?? {});

const sortedApts = computed(() =>
  [...(record.value?.medicalAppointments ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date))
);
const displayedApts = computed(() =>
  showAllApts.value ? sortedApts.value : sortedApts.value.slice(0, APT_PREVIEW)
);

const hasBP        = computed(() => sortedVS.value.some((v) => v.systolicBP != null || v.diastolicBP != null));
const hasO2        = computed(() => sortedVS.value.some((v) => v.oxygenSaturation != null));
const hasWeight    = computed(() => sortedVS.value.some((v) => v.weight != null));
const hasFCChart   = computed(() => sortedVS.value.some((v) => v.heartRate != null));
const hasTempChart = computed(() => sortedVS.value.some((v) => v.temperature != null));
const hasAnyChart  = computed(() => hasBP.value || hasO2.value || hasWeight.value || hasFCChart.value || hasTempChart.value);

// ── Formatters ────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString("es-BO", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" });
};
const formatDOB = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString("es-BO", { timeZone: "UTC", day: "2-digit", month: "long", year: "numeric" });
};
const calcAge = (dob) => {
  if (!dob) return "—";
  return `${Math.floor((Date.now() - new Date(dob)) / (1000 * 60 * 60 * 24 * 365.25))} años`;
};
const bpText      = (vs) => vs.systolicBP && vs.diastolicBP ? `${vs.systolicBP}/${vs.diastolicBP}` : null;
const userFullName = (u) => u ? [u.primerApellido, u.nombres].filter(Boolean).join(" ") : "—";

// ── Estado ────────────────────────────────────────────────────────────────────
const stateOptions = [
  { label: "Activo",         value: "activo" },
  { label: "En tratamiento", value: "en tratamiento" },
  { label: "Cerrado",        value: "cerrado" },
];
const stateSeverity = (s) => s === "activo" ? "success" : s === "en tratamiento" ? "warn" : "secondary";
const stateDot      = (s) => s === "activo" ? "bg-green-500" : s === "en tratamiento" ? "bg-orange-400" : "bg-gray-400";
const aptSeverity   = (s) => s === "Completada" ? "success" : s === "Pendiente" ? "warn" : s === "Cancelada" ? "danger" : s === "Reprogramada" ? "info" : "secondary";
const severityBadge = (s) => s === "severa" ? "bg-red-50 text-red-700 border-red-200" : s === "moderada" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-yellow-50 text-yellow-700 border-yellow-200";

const handleStateChange = async () => {
  try {
    await updateRecordState(record.value._id, currentState.value);
    record.value.state = currentState.value;
  } catch {
    currentState.value = record.value?.state;
  }
};

// ── CDSS — alertas visuales en signos vitales ─────────────────────────────────
const vsAlert = (vs, type) => {
  if (type === "bp") {
    const s = vs.systolicBP, d = vs.diastolicBP;
    if (!s && !d) return null;
    if (s >= 180 || d >= 120 || s < 80)  return "critico";
    if (s >= 140 || d >= 90 || s < 90)   return "advertencia";
    if (s >= 130 || d >= 80)             return "elevado";
  }
  if (type === "hr" && vs.heartRate != null) {
    if (vs.heartRate < 40 || vs.heartRate > 150)  return "critico";
    if (vs.heartRate < 60 || vs.heartRate > 100)  return "advertencia";
  }
  if (type === "temp" && vs.temperature != null) {
    if (vs.temperature < 34 || vs.temperature >= 40)   return "critico";
    if (vs.temperature < 36 || vs.temperature >= 38.5) return "advertencia";
    if (vs.temperature >= 37.6)                         return "elevado";
  }
  if (type === "o2" && vs.oxygenSaturation != null) {
    if (vs.oxygenSaturation < 85) return "critico";
    if (vs.oxygenSaturation < 90) return "advertencia";
    if (vs.oxygenSaturation < 95) return "elevado";
  }
  return null;
};

// Clases Tailwind dinámicas para las tarjetas de signos vitales
const vsCardClass = (level) => {
  if (level === "critico")     return "border-red-200 bg-red-50";
  if (level === "advertencia") return "border-amber-200 bg-amber-50";
  if (level === "elevado")     return "border-blue-200 bg-blue-50";
  return "border-gray-100 bg-gray-50";
};
const vsTextClass = (level) => {
  if (level === "critico")     return "text-red-700";
  if (level === "advertencia") return "text-amber-700";
  if (level === "elevado")     return "text-blue-700";
  return "text-gray-800";
};
const vsIconClass = (level) => {
  if (level === "critico")     return "pi-times-circle text-red-500";
  if (level === "advertencia") return "pi-exclamation-triangle text-amber-500";
  return "pi-info-circle text-blue-400";
};

// ── Abrir modal de agregar ────────────────────────────────────────────────────
const openAdd = (type) => openSubdocModal(record.value, type);

// ── Descargar PDF ─────────────────────────────────────────────────────────────
const downloadPDF = async () => {
  loadingPDF.value = true;
  try {
    const blob = await downloadHealthRecordPDF(route.params.id);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const pat  = record.value?.patient;
    const name = pat ? [pat.primerApellido, pat.nombres].filter(Boolean).join("_") : "historial";
    a.href     = url;
    a.download = `historial_${name}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    toast?.open({ message: "Error al generar el reporte PDF", type: "error" });
  } finally {
    loadingPDF.value = false;
  }
};

// ── Gráficas Chart.js ─────────────────────────────────────────────────────────
const buildCharts = () => {
  chartInstances.forEach((c) => c.destroy());
  chartInstances = [];
  if (!record.value?.vitalSigns?.length) return;

  const vs     = [...sortedVS.value].reverse();
  const labels = vs.map((v) => formatDate(v.date));

  const n = vs.length;
  const baseOpts = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } },
    },
    scales: {
      x: {
        ticks: { font: { size: 9 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 8 },
        grid: { color: "#f1f5f9" },
      },
      y: { ticks: { font: { size: 9 } }, grid: { color: "#f1f5f9" } },
    },
    elements: { point: { radius: n > 12 ? 2 : 4, hoverRadius: 5 } },
  };

  const ds = (label, data, color) => ({ label, data, borderColor: color, backgroundColor: "transparent", tension: 0.3, fill: false, pointRadius: n > 12 ? 2 : 4, pointHoverRadius: 5 });

  if (hasBP.value && bpChartRef.value) {
    chartInstances.push(new Chart(bpChartRef.value, {
      type: "line",
      data: {
        labels,
        datasets: [
          ds("Sistólica",  vs.map((v) => v.systolicBP),  "#EF4444"),
          ds("Diastólica", vs.map((v) => v.diastolicBP), "#3B82F6"),
        ],
      },
      options: baseOpts,
    }));
  }
  if (hasO2.value && o2ChartRef.value) {
    chartInstances.push(new Chart(o2ChartRef.value, {
      type: "line",
      data: { labels, datasets: [ds("SpO₂ (%)", vs.map((v) => v.oxygenSaturation), "#10B981")] },
      options: { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, min: 80, max: 100 } } },
    }));
  }
  if (hasWeight.value && weightChartRef.value) {
    chartInstances.push(new Chart(weightChartRef.value, {
      type: "line",
      data: { labels, datasets: [ds("Peso (kg)", vs.map((v) => v.weight), "#F59E0B")] },
      options: baseOpts,
    }));
  }
  if (hasFCChart.value && heartRateChartRef.value) {
    chartInstances.push(new Chart(heartRateChartRef.value, {
      type: "line",
      data: { labels, datasets: [ds("FC (lpm)", vs.map((v) => v.heartRate), "#DC2626")] },
      options: baseOpts,
    }));
  }
  if (hasTempChart.value && tempChartRef.value) {
    chartInstances.push(new Chart(tempChartRef.value, {
      type: "line",
      data: { labels, datasets: [ds("Temperatura (°C)", vs.map((v) => v.temperature), "#D97706")] },
      options: { ...baseOpts, scales: { ...baseOpts.scales, y: { ...baseOpts.scales.y, min: 35, max: 41 } } },
    }));
  }
};
</script>
