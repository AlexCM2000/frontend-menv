<template>
  <Dialog
    v-model:visible="visibleSubdoc"
    modal
    :closable="!saving"
    :style="{ width: dialogWidth }"
    :breakpoints="{ '960px': '95vw' }"
    :pt="{
      header: { class: 'border-b border-gray-100 pb-0 pt-5 px-6' },
      content: { class: 'px-6 py-5' },
      footer: { class: 'border-t border-gray-100 px-6 py-4' },
    }"
    @hide="onClose"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="typeConfig.bgClass">
          <i class="pi text-base" :class="typeConfig.iconClass"></i>
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-800">{{ typeConfig.title }}</h2>
          <p class="text-xs text-gray-400 mt-0.5">
            Paciente: <span class="font-medium text-gray-600">{{ patientName }}</span>
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4">

      <!-- ── OBSERVACIÓN ── -->
      <template v-if="subdocType === 'observation'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Nota clínica <span class="text-red-500">*</span>
          </label>
          <Textarea v-model="form.note" placeholder="Descripción de la observación clínica..." rows="4" class="w-full" autoResize />
        </div>
      </template>

      <!-- ── DIAGNÓSTICO ── -->
      <template v-else-if="subdocType === 'diagnosis'">

        <!-- Búsqueda CIE-10 -->
        <div v-if="!selectedDiagnosis && !manualDiagnosisMode">
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Buscar diagnóstico <span class="text-red-500">*</span>
          </label>
          <AutoComplete
            v-model="diagnosisQuery"
            :suggestions="filteredDiagnoses"
            @complete="searchDiagnoses"
            @option-select="onDiagnosisSelect"
            placeholder="Código CIE-10 o nombre del diagnóstico..."
            class="w-full"
            fluid
          >
            <template #option="{ option }">
              <div class="flex items-start gap-2.5 py-0.5">
                <span class="shrink-0 font-mono text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded whitespace-nowrap mt-0.5">
                  {{ option.code }}
                </span>
                <span class="text-sm text-gray-700 leading-snug">{{ option.name }}</span>
              </div>
            </template>
            <template #empty>
              <div class="px-3 py-2 text-sm text-gray-500">
                Sin resultados.
                <button type="button" class="text-purple-600 font-semibold hover:underline ml-1" @click.stop="useManualDiagnosis">
                  Ingresar manualmente
                </button>
              </div>
            </template>
          </AutoComplete>
          <p class="text-xs text-gray-400 mt-2">
            ¿No aparece en la lista?
            <button type="button" class="text-purple-600 font-semibold hover:underline ml-0.5" @click="useManualDiagnosis">
              Ingresar manualmente →
            </button>
          </p>
        </div>

        <!-- Card: diagnóstico seleccionado del buscador -->
        <div v-if="selectedDiagnosis" class="rounded-xl border border-purple-200 overflow-hidden">
          <div class="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50 border-b border-purple-100">
            <div class="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center shrink-0">
              <i class="pi pi-check-circle text-purple-600 text-[10px]"></i>
            </div>
            <p class="text-xs font-bold text-purple-700">Diagnóstico seleccionado</p>
            <button type="button" class="ml-auto text-gray-400 hover:text-red-500 transition-colors" @click="clearDiagnosis" title="Cambiar diagnóstico">
              <i class="pi pi-times text-xs"></i>
            </button>
          </div>
          <div class="px-4 py-3 flex items-start gap-3">
            <span class="shrink-0 font-mono text-xs font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg mt-0.5">
              {{ form.code }}
            </span>
            <p class="text-sm font-semibold text-gray-800 leading-snug">{{ form.description }}</p>
          </div>
        </div>

        <!-- Modo manual -->
        <div v-if="manualDiagnosisMode && !selectedDiagnosis" class="rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
            <div class="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center shrink-0">
              <i class="pi pi-pencil text-gray-500 text-[10px]"></i>
            </div>
            <p class="text-xs font-bold text-gray-600">Entrada manual</p>
            <button type="button" class="ml-auto text-xs text-gray-400 hover:text-purple-600 transition-colors" @click="manualDiagnosisMode = false">
              ← Volver al buscador
            </button>
          </div>
          <div class="px-3.5 py-3 space-y-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                Código CIE-10 <span class="font-normal text-gray-400">(opcional)</span>
              </label>
              <InputText v-model="form.code" placeholder="Ej. J06.9" class="w-full font-mono" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                Descripción del diagnóstico <span class="text-red-500">*</span>
              </label>
              <InputText v-model="form.description" placeholder="Ej. Infección aguda de vías respiratorias superiores" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Observaciones (visible al seleccionar o en modo manual) -->
        <div v-if="selectedDiagnosis || manualDiagnosisMode">
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Observaciones <span class="font-normal text-gray-400">(opcional)</span>
          </label>
          <Textarea
            v-model="form.notes"
            placeholder="Contexto clínico, indicaciones adicionales, evolución esperada..."
            rows="3"
            class="w-full"
            autoResize
          />
        </div>

      </template>

      <!-- ── MEDICACIÓN + CDSS interacciones ── -->
      <template v-else-if="subdocType === 'medication'">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Medicamento <span class="text-red-500">*</span>
            </label>
            <InputText
              v-model="form.name"
              placeholder="Ej. Paracetamol"
              class="w-full"
              @blur="checkInteractions"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Dosis <span class="text-red-500">*</span>
            </label>
            <InputText v-model="form.dose" placeholder="Ej. 500mg cada 8h" class="w-full" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Vía de administración
            </label>
            <Select
              v-model="form.route"
              :options="routeOptions"
              placeholder="Seleccionar vía"
              showClear
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Frecuencia</label>
            <InputText v-model="form.frequency" placeholder="Ej. Cada 8 horas" class="w-full" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Inicio</label>
            <DatePicker v-model="form.start" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Fin (opcional)</label>
            <DatePicker v-model="form.end" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
        </div>
        <!-- Alertas de interacción CDSS -->
        <div v-if="interactionAlerts.length" class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alertas de interacción</p>
          <div
            v-for="(alert, i) in interactionAlerts"
            :key="i"
            class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
            :class="interactionAlertClass(alert.level)"
          >
            <i class="pi pi-exclamation-triangle mt-0.5 shrink-0" />
            <span>{{ alert.message }}</span>
          </div>
        </div>
      </template>

      <!-- ── TRATAMIENTO PREVIO ── -->
      <template v-else-if="subdocType === 'treatment'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Tratamiento <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.treatment" placeholder="Nombre del tratamiento" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Tipo de tratamiento</label>
          <Select
            v-model="form.type"
            :options="treatmentTypeOptions"
            placeholder="Seleccionar tipo"
            showClear
            class="w-full"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Desde</label>
            <DatePicker v-model="form.from" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Hasta</label>
            <DatePicker v-model="form.to" dateFormat="dd/mm/yy" class="w-full" showIcon />
          </div>
        </div>
      </template>

      <!-- ── ALERGIA ── -->
      <template v-else-if="subdocType === 'allergy'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Sustancia <span class="text-red-500">*</span>
          </label>
          <InputText v-model="form.substance" placeholder="Ej. Penicilina" class="w-full" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Severidad <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.severity"
            :options="severityOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar severidad"
            class="w-full"
          >
            <template #value="{ value }">
              <div v-if="value" class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full" :class="severityDot(value)" />
                <span>{{ severityOptions.find(o => o.value === value)?.label }}</span>
              </div>
              <span v-else class="text-gray-400">Seleccionar severidad</span>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full" :class="severityDot(option.value)" />
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Reacción <span class="text-red-500">*</span>
          </label>
          <Textarea v-model="form.reaction" placeholder="Descripción de la reacción alérgica..." rows="3" class="w-full" autoResize />
        </div>
      </template>

      <!-- ── SIGNOS VITALES ── -->
      <template v-else-if="subdocType === 'vitalSigns'">

        <!-- Banner informativo -->
        <div class="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-lg px-3.5 py-2.5">
          <i class="pi pi-info-circle text-sky-400 shrink-0 mt-0.5"></i>
          <p class="text-xs text-sky-700 leading-relaxed">Complete solo los campos disponibles. Los valores se compararán con rangos clínicos normales en tiempo real.</p>
        </div>

        <!-- ❶ Presión Arterial -->
        <div class="rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
            <div class="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center shrink-0">
              <i class="pi pi-heart text-red-500 text-[10px]"></i>
            </div>
            <p class="text-xs font-bold text-gray-700">Presión Arterial</p>
            <span class="ml-auto text-[10px] text-gray-400 hidden sm:inline">Ref. normal: Sistólica 90–120 · Diastólica 60–80 mmHg</span>
          </div>
          <div class="px-3.5 py-3 grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                Presión Sistólica <span class="font-normal text-gray-400">(mmHg)</span>
              </label>
              <InputNumber v-model="form.systolicBP" placeholder="Ej. 120" class="w-full" :min="0" :max="300" />
              <span v-if="vsStatus.systolicBP" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="vsStatusBadgeClass(vsStatus.systolicBP)">
                {{ vsStatusLabel(vsStatus.systolicBP) }}
              </span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                Presión Diastólica <span class="font-normal text-gray-400">(mmHg)</span>
              </label>
              <InputNumber v-model="form.diastolicBP" placeholder="Ej. 80" class="w-full" :min="0" :max="200" />
              <span v-if="vsStatus.diastolicBP" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="vsStatusBadgeClass(vsStatus.diastolicBP)">
                {{ vsStatusLabel(vsStatus.diastolicBP) }}
              </span>
            </div>
          </div>
        </div>

        <!-- ❷ Frecuencia Cardíaca -->
        <div class="rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
            <div class="w-6 h-6 rounded-md bg-rose-50 flex items-center justify-center shrink-0">
              <i class="pi pi-heart-fill text-rose-500 text-[10px]"></i>
            </div>
            <p class="text-xs font-bold text-gray-700">Frecuencia Cardíaca</p>
            <span class="ml-auto text-[10px] text-gray-400 hidden sm:inline">Ref. normal: 60–100 lpm</span>
          </div>
          <div class="px-3.5 py-3">
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">
              Pulso <span class="font-normal text-gray-400">(lpm)</span>
            </label>
            <InputNumber v-model="form.heartRate" placeholder="Ej. 72" class="w-full" :min="0" :max="300" />
            <span v-if="vsStatus.heartRate" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="vsStatusBadgeClass(vsStatus.heartRate)">
              {{ vsStatusLabel(vsStatus.heartRate) }}
            </span>
          </div>
        </div>

        <!-- ❸ Temperatura y Saturación de Oxígeno -->
        <div class="rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
            <div class="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center shrink-0">
              <i class="pi pi-sun text-orange-500 text-[10px]"></i>
            </div>
            <p class="text-xs font-bold text-gray-700">Temperatura y Oxigenación</p>
          </div>
          <div class="px-3.5 py-3 grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-0.5">
                Temperatura <span class="font-normal text-gray-400">(°C)</span>
              </label>
              <p class="text-[10px] text-gray-400 mb-1.5">Normal: 36.0–37.5°C</p>
              <InputNumber v-model="form.temperature" placeholder="Ej. 36.5" class="w-full" :min="30" :max="45" :minFractionDigits="1" :maxFractionDigits="1" />
              <span v-if="vsStatus.temperature" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="vsStatusBadgeClass(vsStatus.temperature)">
                {{ vsStatusLabel(vsStatus.temperature) }}
              </span>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-0.5">
                Saturación de Oxígeno <span class="font-normal text-gray-400">(%)</span>
              </label>
              <p class="text-[10px] text-gray-400 mb-1.5">Normal: ≥ 95%</p>
              <InputNumber v-model="form.oxygenSaturation" placeholder="Ej. 98" class="w-full" :min="0" :max="100" />
              <span v-if="vsStatus.oxygenSaturation" class="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full" :class="vsStatusBadgeClass(vsStatus.oxygenSaturation)">
                {{ vsStatusLabel(vsStatus.oxygenSaturation) }}
              </span>
            </div>
          </div>
        </div>

        <!-- ❹ Peso corporal -->
        <div class="rounded-xl border border-gray-200 overflow-hidden">
          <div class="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border-b border-gray-200">
            <div class="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center shrink-0">
              <i class="pi pi-user text-violet-500 text-[10px]"></i>
            </div>
            <p class="text-xs font-bold text-gray-700">Peso corporal</p>
            <span class="ml-auto text-[10px] text-gray-400 hidden sm:inline">Se usa para seguimiento y dosificación</span>
          </div>
          <div class="px-3.5 py-3">
            <label class="block text-xs font-semibold text-gray-600 mb-1.5">
              Peso <span class="font-normal text-gray-400">(kg)</span>
            </label>
            <InputNumber v-model="form.weight" placeholder="Ej. 70.5" class="w-full" :min="0" :max="300" :minFractionDigits="1" :maxFractionDigits="1" />
          </div>
        </div>

        <!-- Observaciones generales -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Observaciones <span class="font-normal text-gray-400">(opcional)</span>
          </label>
          <Textarea v-model="form.notes" placeholder="Notas clínicas adicionales, contexto, síntomas..." rows="2" class="w-full" autoResize />
        </div>

      </template>

      <!-- ── VACUNA ── -->
      <template v-else-if="subdocType === 'vaccine'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre de la vacuna <span class="text-red-500">*</span>
          </label>
          <AutoComplete
            v-model="form.name"
            :suggestions="filteredVaccines"
            @complete="searchVaccines"
            placeholder="Buscar o escribir nombre de vacuna..."
            class="w-full"
            :forceSelection="false"
            dropdown
          />
          <p class="text-[11px] text-gray-400 mt-1">Selecciona del listado PAI o escribe el nombre manualmente.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Número de dosis</label>
            <Select
              v-model="form.doseNumber"
              :options="doseOptions"
              placeholder="Seleccionar dosis"
              class="w-full"
              showClear
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Lote <span class="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <InputText v-model="form.lot" placeholder="Ej. AB12345" class="w-full" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Fecha de aplicación</label>
          <DatePicker v-model="form.date" dateFormat="dd/mm/yy" class="w-full" showIcon />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Observaciones</label>
          <Textarea v-model="form.notes" placeholder="Reacciones locales, observaciones..." rows="2" class="w-full" autoResize />
        </div>
      </template>

      <!-- Error de validación -->
      <p v-if="validationError" class="text-xs text-red-500 flex items-center gap-1">
        <i class="pi pi-exclamation-circle" /> {{ validationError }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          :disabled="saving"
          class="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          @click="onClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="saving"
          class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition flex items-center gap-2"
          :class="typeConfig.btnClass"
          @click="handleSubmit"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner text-xs"></i>
          <i v-else class="pi pi-check text-xs"></i>
          {{ saving ? "Guardando..." : "Guardar" }}
        </button>
      </div>
    </template>
  </Dialog>

  <!-- Diálogo de alertas CDSS post-guardado signos vitales -->
  <Dialog
    v-model:visible="showCdssDialog"
    modal
    header="Alertas clínicas detectadas"
    :style="{ width: '480px' }"
    :breakpoints="{ '640px': '95vw' }"
    :pt="{ header: { class: 'border-b border-gray-100' } }"
  >
    <div class="space-y-3 py-2">
      <p class="text-sm text-gray-600">
        Los siguientes valores requieren atención clínica:
      </p>
      <div
        v-for="(alert, i) in cdssAlerts"
        :key="i"
        class="flex items-start gap-3 rounded-xl p-3"
        :class="cdssAlertClass(alert.level)"
      >
        <i class="pi shrink-0 mt-0.5" :class="cdssAlertIcon(alert.level)" />
        <div>
          <p class="text-xs font-bold uppercase tracking-wide mb-0.5">{{ alert.field }}</p>
          <p class="text-sm">{{ alert.message }}</p>
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Entendido" @click="showCdssDialog = false" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import Button from "primevue/button";
import AutoComplete from "primevue/autocomplete";
import { useRecordStore } from "../store/recordStore";
import { checkDrugInteractions } from "@/data/drugInteractions";

const recordStore = useRecordStore();
const { visibleSubdoc, saving, subdocType, subdocTarget } = storeToRefs(recordStore);
const { closeSubdocModal, onAddSubdoc } = recordStore;

const form = ref({});
const validationError = ref("");
const interactionAlerts = ref([]);
const showCdssDialog = ref(false);
const cdssAlerts = ref([]);

const dialogWidth = computed(() => {
  if (subdocType.value === "vitalSigns") return "720px";
  if (subdocType.value === "diagnosis")  return "560px";
  return "500px";
});

const patientName = computed(() => {
  const p = subdocTarget.value?.patient;
  if (!p) return "—";
  return [p.primerApellido, p.segundoApellido, p.nombres].filter(Boolean).join(" ");
});

const currentMedNames = computed(() =>
  (subdocTarget.value?.medications ?? []).map((m) => m.name).filter(Boolean)
);

const typeConfig = computed(() => {
  const configs = {
    observation: { title: "Agregar observación",      bgClass: "bg-blue-50",   iconClass: "pi-comment text-blue-600",              btnClass: "bg-blue-600 hover:bg-blue-700"   },
    diagnosis:   { title: "Agregar diagnóstico",      bgClass: "bg-purple-50", iconClass: "pi-clipboard text-purple-600",           btnClass: "bg-purple-600 hover:bg-purple-700" },
    medication:  { title: "Agregar medicación",       bgClass: "bg-green-50",  iconClass: "pi-heart text-green-600",               btnClass: "bg-green-600 hover:bg-green-700"  },
    treatment:   { title: "Agregar tratamiento",      bgClass: "bg-amber-50",  iconClass: "pi-star text-amber-600",                btnClass: "bg-amber-600 hover:bg-amber-700"  },
    allergy:     { title: "Agregar alergia",          bgClass: "bg-red-50",    iconClass: "pi-exclamation-triangle text-red-600",  btnClass: "bg-red-600 hover:bg-red-700"      },
    vitalSigns:  { title: "Registrar signos vitales", bgClass: "bg-teal-50",   iconClass: "pi-heart-fill text-teal-600",           btnClass: "bg-teal-600 hover:bg-teal-700"    },
    vaccine:     { title: "Registrar vacuna",         bgClass: "bg-indigo-50", iconClass: "pi-shield text-indigo-600",             btnClass: "bg-indigo-600 hover:bg-indigo-700" },
  };
  return configs[subdocType.value] ?? configs.observation;
});

// ── Diagnóstico CIE-10 ────────────────────────────────────────────────────
const diagnosisQuery      = ref("");
const filteredDiagnoses   = ref([]);
const selectedDiagnosis   = ref(null);
const manualDiagnosisMode = ref(false);

const cie10List = [
  { code: "J06.9", name: "Infección aguda de las vías respiratorias superiores, no especificada" },
  { code: "J00",   name: "Rinofaringitis aguda (resfriado común)" },
  { code: "J02.9", name: "Faringitis aguda, no especificada" },
  { code: "J03.9", name: "Amigdalitis aguda, no especificada" },
  { code: "J18.9", name: "Neumonía, no especificada" },
  { code: "J11",   name: "Influenza debida a virus no identificado" },
  { code: "J45.9", name: "Asma, no especificada" },
  { code: "J32.9", name: "Sinusitis crónica, no especificada" },
  { code: "J44.1", name: "EPOC con exacerbación aguda" },
  { code: "A09",   name: "Gastroenteritis y colitis de origen infeccioso no especificado" },
  { code: "K29.7", name: "Gastritis, no especificada" },
  { code: "K29.5", name: "Gastritis crónica, no especificada" },
  { code: "K21.0", name: "Enfermedad por reflujo gastroesofágico con esofagitis" },
  { code: "K57.3", name: "Enfermedad diverticular del colon sin perforación ni absceso" },
  { code: "K80.1", name: "Cálculo de la vesícula biliar con colecistitis" },
  { code: "K92.2", name: "Hemorragia gastrointestinal, no especificada" },
  { code: "N39.0", name: "Infección de vías urinarias, sitio no especificado" },
  { code: "N20.0", name: "Cálculo del riñón" },
  { code: "N76.0", name: "Vaginitis aguda" },
  { code: "I10",   name: "Hipertensión esencial (primaria)" },
  { code: "I25.1", name: "Enfermedad aterosclerótica del corazón" },
  { code: "I50.9", name: "Insuficiencia cardíaca, no especificada" },
  { code: "E11.9", name: "Diabetes mellitus tipo 2, sin complicaciones" },
  { code: "E11.6", name: "Diabetes mellitus tipo 2 con otras complicaciones especificadas" },
  { code: "E10.9", name: "Diabetes mellitus tipo 1, sin complicaciones" },
  { code: "E78.5", name: "Hiperlipidemia, no especificada" },
  { code: "D50.9", name: "Anemia por deficiencia de hierro, no especificada" },
  { code: "D64.9", name: "Anemia, no especificada" },
  { code: "E44.0", name: "Desnutrición proteico-calórica moderada" },
  { code: "E44.1", name: "Desnutrición proteico-calórica leve" },
  { code: "B82.9", name: "Parasitosis intestinal, sin otra especificación" },
  { code: "B34.9", name: "Infección viral, no especificada" },
  { code: "A15.0", name: "Tuberculosis pulmonar, confirmada por baciloscopia" },
  { code: "M54.5", name: "Lumbago no especificado" },
  { code: "M54.4", name: "Lumbago con ciática" },
  { code: "M79.3", name: "Paniculitis no especificada" },
  { code: "H10.9", name: "Conjuntivitis, no especificada" },
  { code: "H91.9", name: "Hipoacusia, no especificada" },
  { code: "L30.9", name: "Dermatitis, no especificada" },
  { code: "F32.9", name: "Episodio depresivo, no especificado" },
  { code: "F41.9", name: "Trastorno de ansiedad, no especificado" },
  { code: "Z34.0", name: "Supervisión de primer embarazo normal" },
  { code: "Z34.8", name: "Supervisión de otros embarazos normales" },
  { code: "O80",   name: "Parto único espontáneo" },
  { code: "O21.0", name: "Hiperémesis gravídica leve" },
  { code: "O13",   name: "Hipertensión gestacional sin proteinuria significativa" },
  { code: "K40.9", name: "Hernia inguinal unilateral, sin obstrucción ni gangrena" },
  { code: "Z00.0", name: "Examen médico general" },
  { code: "Z30.0", name: "Consejería general sobre anticoncepción" },
  { code: "S09.9", name: "Traumatismo de la cabeza, no especificado" },
  { code: "T14.9", name: "Traumatismo, no especificado" },
];

const searchDiagnoses = (event) => {
  const q = event.query.toLowerCase().trim();
  filteredDiagnoses.value = q
    ? cie10List.filter((d) => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q)).slice(0, 10)
    : cie10List.slice(0, 10);
};

const onDiagnosisSelect = (event) => {
  const item = event.value;
  selectedDiagnosis.value = item;
  form.value.code = item.code;
  form.value.description = item.name;
  diagnosisQuery.value = "";
};

const clearDiagnosis = () => {
  selectedDiagnosis.value = null;
  manualDiagnosisMode.value = false;
  form.value.code = "";
  form.value.description = "";
};

const useManualDiagnosis = () => {
  manualDiagnosisMode.value = true;
  selectedDiagnosis.value = null;
  diagnosisQuery.value = "";
};

// ── Vacunas (PAI Bolivia + comunes) ──────────────────────────────────────────
const vaccineList = [
  "BCG (Tuberculosis)",
  "Hepatitis B",
  "Pentavalente (DPT-HepB-Hib)",
  "Polio oral (OPV)",
  "Polio inactivada (IPV)",
  "Rotavirus",
  "Neumococo (PCV13)",
  "Influenza",
  "Triple viral (SRP - Sarampión, Rubéola, Parotiditis)",
  "SR (Sarampión-Rubéola)",
  "Varicela",
  "Fiebre amarilla",
  "Meningococo",
  "VPH / HPV (Virus del papiloma humano)",
  "Hepatitis A",
  "DPT (refuerzo)",
  "Td (Toxoide tetánico-diftérico)",
  "Tétanos (TT)",
  "COVID-19 - Sinovac",
  "COVID-19 - AstraZeneca",
  "COVID-19 - Pfizer-BioNTech",
  "COVID-19 - Janssen",
  "Rabia (post-exposición)",
  "Fiebre tifoidea",
];

const filteredVaccines = ref([]);

const searchVaccines = (event) => {
  const q = event.query.toLowerCase().trim();
  filteredVaccines.value = q
    ? vaccineList.filter((v) => v.toLowerCase().includes(q))
    : [...vaccineList];
};

const doseOptions = [
  "Dosis única",
  "1ª dosis",
  "2ª dosis",
  "3ª dosis",
  "4ª dosis",
  "Refuerzo",
  "Dosis anual",
];

// Opciones de selectores
const routeOptions = ["Oral", "Intravenosa", "Intramuscular", "Subcutánea", "Tópica", "Inhalada", "Sublingual", "Rectal", "Oftálmica", "Ótica"];
const treatmentTypeOptions = ["Farmacológico", "Quirúrgico", "Fisioterapia", "Rehabilitación", "Radioterapia", "Quimioterapia", "Psicoterapia", "Dietético-nutricional", "Otro"];
const severityOptions = [
  { label: "Leve",    value: "leve"    },
  { label: "Moderada", value: "moderada" },
  { label: "Severa",  value: "severa"  },
];

const severityDot = (v) => {
  if (v === "leve")     return "bg-yellow-400";
  if (v === "moderada") return "bg-orange-400";
  if (v === "severa")   return "bg-red-500";
  return "bg-gray-300";
};

// Estado clínico en tiempo real para cada campo de signos vitales
const vsStatus = computed(() => {
  const { systolicBP: s, diastolicBP: d, heartRate: hr, temperature: t, oxygenSaturation: o2 } = form.value;
  return {
    systolicBP:       s  == null ? null : s  >= 180 ? "critico" : (s  >= 140 || s  < 90)  ? "advertencia" : "normal",
    diastolicBP:      d  == null ? null : d  >= 120 ? "critico" : (d  >= 90  || d  < 60)  ? "advertencia" : "normal",
    heartRate:        hr == null ? null : (hr < 40  || hr > 150) ? "critico" : (hr < 60  || hr > 100) ? "advertencia" : "normal",
    temperature:      t  == null ? null : (t  < 34  || t  >= 40) ? "critico" : (t  < 36  || t  >= 38.5) ? "advertencia" : t >= 37.6 ? "elevado" : "normal",
    oxygenSaturation: o2 == null ? null : o2 < 85 ? "critico"   : o2 < 90  ? "advertencia" : o2 < 95 ? "elevado" : "normal",
  };
});

const vsStatusBadgeClass = (status) => {
  if (status === "normal")      return "bg-green-100 text-green-700";
  if (status === "elevado")     return "bg-blue-100 text-blue-700";
  if (status === "advertencia") return "bg-amber-100 text-amber-700";
  if (status === "critico")     return "bg-red-100 text-red-700";
  return "";
};

const vsStatusLabel = (status) => {
  if (status === "normal")      return "✓ Normal";
  if (status === "elevado")     return "↑ Elevado";
  if (status === "advertencia") return "⚠ Advertencia";
  if (status === "critico")     return "⚠ Crítico";
  return "";
};

// CDSS interacciones
const checkInteractions = () => {
  interactionAlerts.value = checkDrugInteractions(form.value.name, currentMedNames.value);
};

const interactionAlertClass = (level) => {
  if (level === "critico")     return "bg-red-50 border border-red-200 text-red-700";
  if (level === "advertencia") return "bg-amber-50 border border-amber-200 text-amber-700";
  return "bg-blue-50 border border-blue-200 text-blue-700";
};

const cdssAlertClass = (level) => {
  if (level === "critico")     return "bg-red-50 border border-red-200 text-red-800";
  if (level === "advertencia") return "bg-amber-50 border border-amber-200 text-amber-800";
  return "bg-blue-50 border border-blue-200 text-blue-800";
};

const cdssAlertIcon = (level) => {
  if (level === "critico")     return "pi-times-circle text-red-500";
  if (level === "advertencia") return "pi-exclamation-triangle text-amber-500";
  return "pi-info-circle text-blue-500";
};

const validate = () => {
  validationError.value = "";
  const t = subdocType.value;
  if (t === "observation" && !form.value.note?.trim()) {
    validationError.value = "La nota clínica es obligatoria.";
    return false;
  }
  if (t === "diagnosis" && !form.value.description?.trim()) {
    validationError.value = "La descripción del diagnóstico es obligatoria.";
    return false;
  }
  if (t === "medication" && (!form.value.name?.trim() || !form.value.dose?.trim())) {
    validationError.value = "El medicamento y la dosis son obligatorios.";
    return false;
  }
  if (t === "treatment" && !form.value.treatment?.trim()) {
    validationError.value = "El nombre del tratamiento es obligatorio.";
    return false;
  }
  if (t === "allergy" && (!form.value.substance?.trim() || !form.value.reaction?.trim())) {
    validationError.value = "La sustancia y la reacción son obligatorias.";
    return false;
  }
  if (t === "allergy" && !form.value.severity) {
    validationError.value = "Seleccione la severidad de la alergia.";
    return false;
  }
  if (t === "vitalSigns") {
    const hasValue = ["systolicBP","diastolicBP","heartRate","temperature","oxygenSaturation","weight"]
      .some((k) => form.value[k] !== null && form.value[k] !== undefined);
    if (!hasValue) {
      validationError.value = "Ingrese al menos un signo vital.";
      return false;
    }
  }
  if (t === "vaccine" && !form.value.name?.trim()) {
    validationError.value = "El nombre de la vacuna es obligatorio.";
    return false;
  }
  return true;
};

const handleSubmit = async () => {
  if (!validate()) return;
  const result = await onAddSubdoc({ ...form.value });
  if (result?.alerts?.length) {
    cdssAlerts.value = result.alerts;
    showCdssDialog.value = true;
  }
};

const resetForm = () => {
  form.value = {};
  validationError.value = "";
  interactionAlerts.value = [];
  diagnosisQuery.value = "";
  selectedDiagnosis.value = null;
  manualDiagnosisMode.value = false;
};

const onClose = () => {
  resetForm();
  closeSubdocModal();
};

watch(visibleSubdoc, (val) => {
  if (!val) resetForm();
});
</script>
