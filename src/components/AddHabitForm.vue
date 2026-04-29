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
          Habits are saved locally in your browser and restored after refresh.
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";

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
});

const errorMessage = ref("");

const isEditing = computed(() => Boolean(props.habit));

watch(
  () => props.habit,
  (habit) => {
    form.name = habit?.name ?? "";
    form.description = habit?.description ?? "";
    errorMessage.value = "";
  },
  { immediate: true },
);

function submitForm() {
  if (!form.name.trim()) {
    errorMessage.value = "Habit name is required.";
    return;
  }

  emit("save", {
    name: form.name.trim(),
    description: form.description.trim(),
  });
}
</script>
