<template>
  <div class="px-3 sm:px-5 pt-4">
    <Card :pt="{ body: { class: 'px-3 sm:px-5' } }">
      <template #title>
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <p class="font-bold text-base text-gray-800">Citas médicas</p>
            <p class="text-xs font-normal text-gray-400 mt-0.5">
              {{ totalRecords }} registro{{
                totalRecords !== 1 ? "s" : ""
              }}
              encontrado{{ totalRecords !== 1 ? "s" : "" }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <Button
              v-if="user?.admin || user?.branchManager"
              label="Nueva cita"
              icon="pi pi-plus"
              size="small"
              @click="showNewModal = true"
            />
            <ExportMenu
              v-if="user?.admin || user?.branchManager"
              endpoint="/export/appointments"
              :params="exportParams"
              filename="citas_medicas"
            />
          </div>
        </div>
      </template>

      <template #content>
        <!-- Barra de filtros -->
        <div class="flex flex-col sm:flex-row gap-2 mb-4 sm:items-center">
          <!-- Búsqueda (admin y branchManager): flex-1 en desktop -->
          <IconField
            v-if="user?.admin || user?.branchManager"
            class="w-full sm:flex-1"
          >
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="search"
              placeholder="Buscar por nombre, email o SUS..."
              class="w-full"
              @keyup.enter="handleSubmit"
            />
          </IconField>

          <!-- Estado (todos los roles) -->
          <Select
            v-model="selectedState"
            :options="stateOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Estado"
            showClear
            class="w-full sm:w-44"
          >
            <template #value="{ value }">
              <div v-if="value" class="flex items-center gap-2">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  :class="stateDot(value)"
                />
                <span>{{ value }}</span>
              </div>
              <span v-else class="text-gray-400">Estado</span>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <span
                  class="inline-block w-2 h-2 rounded-full"
                  :class="stateDot(option.value)"
                />
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>

          <!-- Rango de fechas (admin y branchManager) -->
          <DatePicker
            v-if="user?.admin || user?.branchManager"
            v-model="dateRange"
            selectionMode="range"
            :manualInput="false"
            placeholder="Rango de fechas"
            showButtonBar
            showIcon
            class="w-full sm:w-60"
            dateFormat="dd/mm/yy"
          />

          <!-- Centro de salud (solo admin) -->
          <Select
            v-if="user?.admin"
            v-model="selectedHealth"
            :options="healths"
            optionLabel="label"
            optionValue="value"
            placeholder="Centro de salud"
            showClear
            class="w-full sm:w-48"
          />

          <!-- Acciones -->
          <div class="flex gap-2 sm:ml-auto">
            <Button
              label="Buscar"
              icon="pi pi-search"
              class="flex-1 sm:flex-none"
              @click="handleSubmit"
            />
            <Button
              icon="pi pi-filter-slash"
              severity="secondary"
              outlined
              class="flex-shrink-0"
              v-tooltip.top="'Limpiar filtros'"
              @click="clearAllFilters"
            />
          </div>
        </div>

        <!-- Skeleton loader -->
        <DataTable v-if="loading" :value="Array(5).fill({})" showGridLines>
          <Column v-for="n in 5" :key="n" style="min-width: 120px">
            <template #header><Skeleton width="60%" height="1rem" /></template>
            <template #body><Skeleton width="75%" height="0.85rem" /></template>
          </Column>
        </DataTable>

        <!-- Tabla -->
        <DataTable
          v-else
          :value="userAppointments"
          v-model:first="page_first"
          :total-records="totalRecords"
          @page="onPage($event)"
          :rowsPerPageOptions="[10, 20, 50]"
          showGridLines
          paginator
          :rows="10"
          lazy
          stripedRows
          scrollable
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-12 gap-3">
              <img
                src="/img/undraw_no_data.svg"
                alt="Sin datos"
                class="w-44 opacity-60"
              />
              <p class="text-sm text-gray-400">
                No se encontraron citas médicas
              </p>
            </div>
          </template>

          <!-- Servicio -->
          <Column style="min-width: 160px">
            <template #header
              ><p class="font-semibold text-sm">Servicio</p></template
            >
            <template #body="{ data }">
              <p
                class="text-xs text-gray-400 uppercase tracking-wide leading-none mb-0.5"
              >
                {{ data?.services[0]?.category ?? "—" }}
              </p>
              <p class="font-semibold text-sm text-gray-700">
                {{ data?.services[0]?.name ?? "—" }}
              </p>
              <p
                v-if="data?.notes"
                class="text-xs text-gray-400 italic mt-0.5 truncate max-w-[180px]"
                :title="data.notes"
              >
                {{ data.notes }}
              </p>
            </template>
          </Column>

          <!-- Fecha / Hora -->
          <Column style="min-width: 130px">
            <template #header
              ><p class="font-semibold text-sm">Fecha / Hora</p></template
            >
            <template #body="{ data }">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-calendar text-xs text-gray-400" />
                <p class="text-sm text-gray-700">
                  {{ formatDate(data?.date) }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <i class="pi pi-clock text-xs text-gray-400" />
                <p class="text-xs text-gray-400">{{ data?.time }}</p>
              </div>
            </template>
          </Column>

          <!-- Paciente (admin, branchManager y médico) -->
          <Column
            v-if="user?.admin || user?.branchManager || user?.doctor"
            style="min-width: 190px"
          >
            <template #header
              ><p class="font-semibold text-sm">Paciente</p></template
            >
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <Avatar
                  :label="getInitials(data?.user || data?.patient)"
                  shape="circle"
                  class="bg-indigo-100 text-indigo-700 font-semibold flex-shrink-0 text-xs"
                />
                <div class="min-w-0">
                  <p class="font-semibold text-sm text-gray-800 truncate">
                    {{ getPatientName(data) }}
                  </p>
                  <p class="text-xs text-gray-400 truncate">
                    {{
                      data?.user?.email ??
                      (data?.patient ? "Sin cuenta de usuario" : "")
                    }}
                  </p>
                </div>
              </div>
            </template>
          </Column>

          <!-- Centro médico -->
          <Column style="min-width: 130px" class="hidden md:table-cell">
            <template #header
              ><p class="font-semibold text-sm">Centro médico</p></template
            >
            <template #body="{ data }">
              <p class="text-sm text-gray-500">
                {{ data?.health?.name ?? "—" }}
              </p>
            </template>
          </Column>

          <!-- Médico -->
          <Column style="min-width: 150px" class="hidden lg:table-cell">
            <template #header
              ><p class="font-semibold text-sm">Médico</p></template
            >
            <template #body="{ data }">
              <div v-if="data?.doctor" class="flex items-center gap-1.5">
                <i class="pi pi-user text-xs text-indigo-400" />
                <div>
                  <p class="text-sm text-gray-700 font-medium">
                    {{ data.doctor.name }}
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ data.doctor.specialty }}
                  </p>
                </div>
              </div>
              <span v-else class="text-xs text-gray-400">Sin asignar</span>
            </template>
          </Column>

          <!-- Estado -->
          <Column style="min-width: 110px">
            <template #header
              ><p class="font-semibold text-sm">Estado</p></template
            >
            <template #body="{ data }">
              <Tag
                :value="data?.state"
                :severity="appointmentSeverity(data?.state)"
                class="text-xs"
              />
            </template>
          </Column>

          <!-- Acción -->
          <Column style="min-width: 60px; text-align: center">
            <template #header
              ><p class="font-semibold text-sm">Acción</p></template
            >
            <template #body="{ data }">
              <div class="flex justify-center">
                <Button
                  icon="pi pi-ellipsis-h"
                  text
                  rounded
                  size="small"
                  @click="openPanel($event, data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Modal Nueva Cita -->
        <ModalAdminAppointment
          v-model:visible="showNewModal"
          @created="getUserAppointments(user._id)"
        />

        <!-- Modal Editar Cita  -->
        <ModalEditAdminAppointment
          v-model:visible="showEditModal"
          :appointment="editAppointment"
          @updated="getUserAppointments(user._id)"
        />

        <!-- Modal Reprogramar Cita -->
        <Dialog
          v-model:visible="showRescheduleModal"
          modal
          header="Reprogramar cita"
          :style="{ width: '30rem' }"
          :breakpoints="{ '640px': '95vw' }"
        >
          <div class="space-y-4 pt-1">
            <p class="text-sm text-gray-500">
              Selecciona la nueva fecha y hora. Se notificará por correo al
              paciente y al médico.
            </p>

            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1"
                >Nueva fecha <span class="text-red-500">*</span></label
              >
              <DatePicker
                v-model="rescheduleForm.date"
                :minDate="tomorrow"
                :maxDate="endOfCurrentWeek"
                :disabledDays="rescheduleDisabledDays"
                dateFormat="dd/mm/yy"
                placeholder="Seleccione una fecha"
                showIcon
                class="w-full"
                @update:modelValue="onRescheduleDateChange"
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1"
                >Nueva hora <span class="text-red-500">*</span></label
              >
              <Select
                v-model="rescheduleForm.time"
                :options="rescheduleTimeSlots"
                :disabled="!rescheduleForm.date || loadingRescheduleSlots"
                :placeholder="
                  !rescheduleForm.date
                    ? 'Seleccione primero una fecha'
                    : loadingRescheduleSlots
                      ? 'Cargando horarios...'
                      : 'Seleccione una hora'
                "
                :optionDisabled="(opt) => rescheduleOccupied.includes(opt)"
                class="w-full"
              >
                <template #option="{ option }">
                  <div class="flex items-center justify-between w-full gap-3">
                    <div class="flex items-center gap-2">
                      <i
                        class="pi text-xs"
                        :class="
                          rescheduleOccupied.includes(option)
                            ? 'pi-lock text-red-400'
                            : 'pi-clock text-green-500'
                        "
                      />
                      <span
                        :class="
                          rescheduleOccupied.includes(option)
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                        "
                      >
                        {{ option }}
                      </span>
                    </div>
                    <span
                      class="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
                      :class="
                        rescheduleOccupied.includes(option)
                          ? 'bg-red-50 text-red-400'
                          : 'bg-green-50 text-green-600'
                      "
                    >
                      {{
                        rescheduleOccupied.includes(option)
                          ? "Ocupado"
                          : "Disponible"
                      }}
                    </span>
                  </div>
                </template>
              </Select>
              <!-- Leyenda -->
              <div
                v-if="rescheduleForm.date && !loadingRescheduleSlots"
                class="flex items-center gap-4 mt-1.5"
              >
                <span class="flex items-center gap-1 text-xs text-green-600">
                  <i class="pi pi-clock text-[10px]" /> Disponible
                </span>
                <span class="flex items-center gap-1 text-xs text-red-400">
                  <i class="pi pi-lock text-[10px]" /> Ocupado (no
                  seleccionable)
                </span>
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium text-sm mb-1">
                Motivo de reprogramación
                <span class="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                v-model="rescheduleForm.notes"
                rows="2"
                maxlength="300"
                placeholder="Razón del cambio..."
                class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex gap-2 justify-end pt-2">
              <Button
                label="Cancelar"
                severity="secondary"
                outlined
                @click="showRescheduleModal = false"
              />
              <Button
                label="Confirmar reprogramación"
                icon="pi pi-calendar"
                severity="warn"
                :loading="rescheduling"
                @click="confirmReschedule"
              />
            </div>
          </template>
        </Dialog>

        <!-- Popover -->
        <Popover ref="panel" appendTo="body" style="min-width: 185px">
          <p class="text-xs text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1 font-semibold">Opciones</p>
          <!-- Acciones -->
          <div class="border-b border-gray-100 pb-1 mb-1">
            <!-- <button
              class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors w-full"
              @click="openEditModal(activeRow)"
            >
              <i class="pi pi-pencil text-xs text-blue-500" />
              Editar cita
            </button> -->
            <button
              class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors w-full"
              @click="openRescheduleModal"
            >
              <i class="pi pi-calendar text-xs text-orange-500" />
              Reprogramar
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors w-full"
              @click="onPrintReceipt(activeRow)"
            >
              <i class="pi pi-print text-xs text-teal-600" />
              Imprimir comprobante
            </button>
          </div>

          <!-- Cambio rápido de estado (excepto Reprogramada) -->
          <p
            class="text-xs text-gray-400 uppercase tracking-wider px-4 pt-1 pb-1 font-semibold"
          >
            Cambiar estado
          </p>
          <ul class="pb-1">
            <li
              v-for="s in [
                'Pendiente',
                'Completada',
                'Cancelada',
                'No asistio',
              ]"
              :key="s"
              class="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
              :class="{ 'font-semibold': activeRow?.state === s }"
              @click="changeState(s)"
            >
              <span
                class="inline-block w-2 h-2 rounded-full"
                :class="stateDot(s)"
              />
              {{ s }}
              <i
                v-if="activeRow?.state === s"
                class="pi pi-check ml-auto text-xs text-gray-400"
              />
            </li>
          </ul>
        </Popover>
      </template>
    </Card>

    <!-- Recordatorio flotante: historial médico pendiente -->
    <Transition name="reminder">
      <div
        v-if="completedReminder"
        class="fixed bottom-6 right-6 z-50 bg-white border border-amber-200 shadow-xl rounded-2xl p-4 w-80 overflow-hidden"
      >
        <div class="absolute bottom-0 left-0 h-0.5 bg-amber-400 reminder-bar" />
        <div class="flex items-start gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-clipboard text-amber-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 leading-tight">
              Recuerda actualizar el historial
            </p>
            <p class="text-xs text-gray-500 mt-0.5 truncate">
              {{ completedReminder.patientName }}
            </p>
            <button
              class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors disabled:opacity-50"
              :disabled="loadingReminder"
              @click="openRecordFromReminder"
            >
              <i
                class="pi text-xs"
                :class="
                  loadingReminder ? 'pi-spin pi-spinner' : 'pi-arrow-right'
                "
              />
              {{ loadingReminder ? "Abriendo..." : "Ir al historial" }}
            </button>
          </div>
          <button
            class="text-gray-300 hover:text-gray-500 transition-colors -mt-0.5"
            @click="completedReminder = null"
          >
            <i class="pi pi-times text-xs" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import AppointmentApi from "@/api/AppointmentApi";
import DoctorScheduleApi from "@/api/doctorScheduleApi";
import { formatDate, convertToDDMMYYYY } from "@/helpers/date";
import { useHealthStore } from "@/stores/healths";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import DatePicker from "primevue/datepicker";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Popover from "primevue/popover";
import Select from "primevue/select";
import Skeleton from "primevue/skeleton";
import Tag from "primevue/tag";
import { inject, computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ExportMenu from "@/components/ExportMenu.vue";
import ModalAdminAppointment from "@/components/ModalAdminAppointment.vue";
import ModalEditAdminAppointment from "@/components/ModalEditAdminAppointment.vue";
import { printReceipt } from "@/composables/usePrintReceipt";
import { getRecordByAppointment } from "@/modules/medical-record/api/recordsApi";

const toast = inject("toast");
const router = useRouter();

const userAuth = useUserStore();
const {
  loading,
  totalRecords,
  user,
  userAppointments,
  page_first,
  dateFrom,
  dateTo,
} = storeToRefs(userAuth);
const {
  onPage,
  onSearch,
  getSelectedHealths,
  setAppointmentState,
  getUserAppointments,
  setDateFilter,
} = userAuth;

const healthStore = useHealthStore();
const { getHealths } = healthStore;
const { healths } = storeToRefs(healthStore);

onMounted(async () => {
  await userAuth.getUser();
  await getUserAppointments(user.value._id);
  if (user.value?.admin) await getHealths();
});

const selectedHealth = ref(null);
const selectedState = ref(null);
const search = ref("");
const dateRange = ref(null);
const panel = ref(null);
const activeRow = ref(null);
const showNewModal = ref(false);
const completedReminder = ref(null);
const loadingReminder = ref(false);
let reminderTimer = null;

// Editar cita
const showEditModal = ref(false);
const editAppointment = ref(null);

const openEditModal = (data) => {
  panel.value?.hide();
  editAppointment.value = data;
  showEditModal.value = true;
};

const onPrintReceipt = (data) => {
  panel.value?.hide();
  printReceipt(data);
};

// Reprogramar cita
const showRescheduleModal = ref(false);
const rescheduleForm = ref({ date: null, time: null, notes: "" });
const rescheduling = ref(false);
const loadingRescheduleSlots = ref(false);
const rescheduleOccupied = ref([]);
const rescheduleDisabledDays = ref([0]);

const DAY_NUM_MAP_RESCHEDULE = {
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
};
const ALL_WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

const tomorrow = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
});

const endOfCurrentWeek = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sat = new Date(today);
  sat.setDate(today.getDate() + (6 - today.getDay()));
  sat.setHours(23, 59, 59, 999);
  return sat;
});

// Slots fijos del horario (sin slots extra fuera de rango)
const rescheduleTimeSlots = computed(() => {
  const slots = [];
  const addSlots = (startH, startM, endH, endM) => {
    for (let h = startH; h <= endH; h++) {
      const minStart = h === startH ? startM : 0;
      const minEnd = h === endH ? endM : 59;
      for (let m = minStart; m <= minEnd; m += 20) {
        slots.push(`${h}:${String(m).padStart(2, "0")}`);
      }
    }
  };
  addSlots(8, 30, 12, 30);
  addSlots(14, 30, 18, 0);
  return slots;
});

const onRescheduleDateChange = async (newDate) => {
  rescheduleForm.value.time = null;
  rescheduleOccupied.value = [];
  if (!newDate || !activeRow.value) return;
  loadingRescheduleSlots.value = true;
  try {
    const category = activeRow.value.services?.[0]?.category ?? null;
    const excludeId = activeRow.value._id;
    const apptDoctor =
      activeRow.value.doctor?._id ?? activeRow.value.doctor ?? null;
    const formattedDate = convertToDDMMYYYY(newDate.toISOString());
    const { data } = await AppointmentApi.getAvailability(
      formattedDate,
      category,
      excludeId,
      apptDoctor,
    );
    const appts = data.appointments ?? [];
    const doctors = data.doctors ?? [];
    const shiftInfo = data.shiftInfo ?? null;

    rescheduleOccupied.value = rescheduleTimeSlots.value.filter((slot) => {
      const hourNum = parseInt(slot.split(":")[0]);
      const isMorning = hourNum < 13;
      if (shiftInfo) {
        if (isMorning && !shiftInfo.morning) return true;
        if (!isMorning && !shiftInfo.afternoon) return true;
      }
      const atSlot = appts.filter((a) => a.time === slot);
      if (doctors.length > 0 && atSlot.length >= doctors.length) return true;
      if (apptDoctor) {
        return atSlot.some(
          (a) =>
            (a.doctor?.toString() ?? String(a.doctor)) ===
            apptDoctor.toString(),
        );
      }
      return false;
    });
  } catch (e) {
    console.error("Error al cargar disponibilidad:", e);
    rescheduleOccupied.value = [];
  } finally {
    loadingRescheduleSlots.value = false;
  }
};

const openRescheduleModal = async () => {
  panel.value?.hide();
  rescheduleForm.value = {
    date: null,
    time: null,
    notes: activeRow.value?.notes ?? "",
  };
  rescheduleOccupied.value = [];
  rescheduleDisabledDays.value = [0];

  const apptDoctor =
    activeRow.value?.doctor?._id ?? activeRow.value?.doctor ?? null;
  if (apptDoctor) {
    try {
      const { data } = await DoctorScheduleApi.getSchedules(apptDoctor);
      const activeDayNums = data
        .filter((s) => s.active && (s.morning || s.afternoon))
        .map((s) => DAY_NUM_MAP_RESCHEDULE[s.dayOfWeek])
        .filter((n) => n !== undefined);
      rescheduleDisabledDays.value =
        activeDayNums.length > 0
          ? ALL_WEEK_DAYS.filter((d) => !activeDayNums.includes(d))
          : ALL_WEEK_DAYS;
    } catch {
      rescheduleDisabledDays.value = [0];
    }
  }

  showRescheduleModal.value = true;
};

const confirmReschedule = async () => {
  if (!rescheduleForm.value.date || !rescheduleForm.value.time) {
    toast?.open({
      message: "Selecciona la nueva fecha y hora",
      type: "warning",
    });
    return;
  }
  rescheduling.value = true;
  const snapshot = activeRow.value;
  const prev = snapshot.state;
  const idx = userAppointments.value.findIndex((a) => a._id === snapshot._id);
  if (idx !== -1) userAppointments.value[idx].state = "Reprogramada";
  try {
    await AppointmentApi.update(snapshot._id, {
      state: "Reprogramada",
      date: rescheduleForm.value.date.toISOString(),
      time: rescheduleForm.value.time,
      notes: rescheduleForm.value.notes,
    });
    toast?.open({
      message: "Cita reprogramada correctamente",
      type: "success",
    });
    showRescheduleModal.value = false;
    getUserAppointments(user.value._id);
  } catch (err) {
    if (idx !== -1) userAppointments.value[idx].state = prev;
    toast?.open({
      message: err.response?.data?.msg || "No se pudo reprogramar la cita",
      type: "error",
    });
  } finally {
    rescheduling.value = false;
  }
};

const exportParams = computed(() => ({
  ...(search.value && { search: search.value }),
  ...(selectedState.value && { state: selectedState.value }),
  ...(selectedHealth.value && { health: selectedHealth.value }),
  ...(dateFrom.value && { date_from: dateFrom.value }),
  ...(dateTo.value && { date_to: dateTo.value }),
}));

const stateOptions = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Reprogramada", value: "Reprogramada" },
  { label: "Cancelada", value: "Cancelada" },
  { label: "Completada", value: "Completada" },
  { label: "No asistio", value: "No asistio" },
];

const stateDot = (state) => ({
  "bg-yellow-400": state === "Pendiente",
  "bg-blue-400": state === "Reprogramada",
  "bg-red-400": state === "Cancelada",
  "bg-green-500": state === "Completada",
  "bg-gray-400": state === "No asistio",
});

const appointmentSeverity = (state) => {
  if (state === "Completada") return "success";
  if (state === "Pendiente") return "warn";
  if (state === "Cancelada") return "danger";
  if (state === "Reprogramada") return "info";
  return "secondary";
};

function getInitials(src) {
  const a = src?.primerApellido?.[0] ?? "";
  const n = src?.nombres?.[0] ?? "";
  return (a + n).toUpperCase() || "?";
}

function getPatientName(data) {
  const src = data?.user || data?.patient;
  return (
    [src?.primerApellido, src?.segundoApellido, src?.nombres]
      .filter(Boolean)
      .join(" ") || "—"
  );
}

watch(selectedHealth, async (val) => {
  await getSelectedHealths(val ?? "");
});

watch(selectedState, async (val) => {
  await setAppointmentState(val ?? "");
});

watch(search, (val) => {
  if (!val || val.length === 0) onSearch("");
});

watch(dateRange, async (val) => {
  if (val && val[0] && val[1]) {
    await setDateFilter(val[0].toISOString(), val[1].toISOString());
  } else if (!val) {
    await setDateFilter(null, null);
  }
});

const handleSubmit = () => {
  if (search.value?.length >= 2) onSearch(search.value);
};

const clearAllFilters = async () => {
  search.value = "";
  selectedState.value = null;
  selectedHealth.value = null;
  dateRange.value = null;
  await onSearch("");
  await setAppointmentState("");
  await getSelectedHealths("");
  await setDateFilter(null, null);
};

function openPanel(event, data) {
  activeRow.value = data;
  panel.value.toggle(event);
}

const changeState = async (state) => {
  panel.value?.hide();
  if (!activeRow.value?._id) return;

  // Update optimista: cambio visual inmediato sin esperar al servidor
  const snapshot = activeRow.value;
  const prev = snapshot.state;
  const idx = userAppointments.value.findIndex((a) => a._id === snapshot._id);
  if (idx !== -1) userAppointments.value[idx].state = state;

  try {
    await AppointmentApi.update(snapshot._id, { state });
    toast?.open({ message: `Cita marcada como "${state}"`, type: "success" });

    // Recordatorio no bloqueante cuando se completa
    if (
      state === "Completada" &&
      (user.value?.doctor || user.value?.admin || user.value?.branchManager)
    ) {
      const src = snapshot.user || snapshot.patient;
      const patientName =
        [src?.primerApellido, src?.segundoApellido, src?.nombres]
          .filter(Boolean)
          .join(" ") || "Paciente";
      clearTimeout(reminderTimer);
      completedReminder.value = { appointmentId: snapshot._id, patientName };
      reminderTimer = setTimeout(() => {
        completedReminder.value = null;
      }, 12000);
    }

    // Refetch silencioso en segundo plano
    getUserAppointments(user.value._id);
  } catch {
    // Revertir update optimista
    if (idx !== -1) userAppointments.value[idx].state = prev;
    toast?.open({
      message: "No se pudo actualizar el estado de la cita",
      type: "error",
    });
  }
};

const openRecordFromReminder = async () => {
  if (!completedReminder.value?.appointmentId) return;
  loadingReminder.value = true;
  try {
    const { healthRecordId } = await getRecordByAppointment(
      completedReminder.value.appointmentId,
    );
    completedReminder.value = null;
    router.push({
      name: "health-record-detail",
      params: { id: healthRecordId },
    });
  } catch {
    toast?.open({
      message: "El paciente no tiene historial médico registrado",
      type: "warning",
    });
  } finally {
    loadingReminder.value = false;
  }
};
</script>

<style scoped>
/* Barra de progreso del recordatorio */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
.reminder-bar {
  animation: shrink 12s linear forwards;
}

/* Transición de entrada/salida del recordatorio */
.reminder-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.reminder-leave-active {
  transition: all 0.2s ease-in;
}
.reminder-enter-from {
  opacity: 0;
  transform: translateY(1rem) scale(0.95);
}
.reminder-leave-to {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.97);
}
</style>
