<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <section
      class="modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-form-title"
    >
      <div class="modal-head">
        <div>
          <h3 id="habit-form-title">
            {{ isEditing ? "Edit habit" : "Add a new habit" }}
          </h3>
          <p>
            Keep the habit short and specific so it is easier to repeat daily.
          </p>
        </div>

        <button class="icon-button" type="button" :disabled="saving" @click="$emit('close')">
          Close
        </button>
      </div>

      <form class="habit-form" @submit.prevent="submitForm">
        <div class="field">
          <label for="habit-name">Habit name</label>
          <input
            id="habit-name"
            v-model.trim="form.name"
            type="text"
            maxlength="60"
            placeholder="Exercise, Read, Journal..."
            :disabled="saving"
          />
        </div>

        <div class="field">
          <label for="habit-description">Description</label>
          <textarea
            id="habit-description"
            v-model.trim="form.description"
            maxlength="180"
            placeholder="Optional note or reminder"
            :disabled="saving"
          />
        </div>

        <div class="field-grid">
          <div class="field">
            <label for="habit-category">Category</label>
            <select id="habit-category" v-model="form.category" :disabled="saving">
              <option v-for="category in categoryOptions" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="habit-frequency">Frequency</label>
            <select id="habit-frequency" v-model="form.frequency" :disabled="saving">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div class="field-grid">
          <div class="field">
            <label for="habit-reminder">Reminder time</label>
            <input
              id="habit-reminder"
              v-model="form.reminderTime"
              type="time"
              :disabled="saving"
            />
          </div>

          <div class="field">
            <label for="habit-notes">Notes</label>
            <input
              id="habit-notes"
              v-model.trim="form.notes"
              type="text"
              maxlength="120"
              placeholder="Optional note or cue"
              :disabled="saving"
            />
          </div>
        </div>

        <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>

        <div class="form-actions">
          <button class="primary-button" type="submit" :disabled="saving">
            {{ saving ? "Saving..." : isEditing ? "Save changes" : "Create habit" }}
          </button>
          <button class="ghost-button" type="button" :disabled="saving" @click="$emit('close')">
            Cancel
          </button>
        </div>

        <p class="helper-note">
          Habits sync to MongoDB and can carry category, reminder, and note details.
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { HABIT_CATEGORY_OPTIONS } from "../utils/habitMeta";

const props = defineProps({
  habit: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "save"]);

const form = reactive({
  name: "",
  description: "",
  category: "Health",
  frequency: "daily",
  reminderTime: "",
  notes: "",
});

const errorMessage = ref("");

const isEditing = computed(() => Boolean(props.habit));

watch(
  () => props.habit,
  (habit) => {
    form.name = habit?.name ?? "";
    form.description = habit?.description ?? "";
    form.category = habit?.category ?? "Health";
    form.frequency = habit?.frequency ?? "daily";
    form.reminderTime = habit?.reminderTime ?? "";
    form.notes = habit?.notes ?? "";
    errorMessage.value = "";
  },
  { immediate: true },
);

const categoryOptions = HABIT_CATEGORY_OPTIONS;

function submitForm() {
  if (!form.name.trim()) {
    errorMessage.value = "Habit name is required.";
    return;
  }

  emit("save", {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    frequency: form.frequency,
    reminderTime: form.reminderTime,
    notes: form.notes.trim(),
  });
}
</script>
