<template>
  <div class="booking">

    <label>Chambre :</label>
    <select v-model="presenter.viewModel.selectedRoomId">
      <option v-for="roomType in presenter.viewModel.roomTypes" :value="roomType.id">{{
          roomType.priceLabel()
        }}
      </option>
    </select>

    <label>Date début :</label>
    <input type="date" v-model="presenter.viewModel.startDate"/>

    <label>Date fin :</label>
    <input type="date" v-model="presenter.viewModel.endDate"/>

    <label>Code promo :</label>
    <input type="text" v-model="presenter.viewModel.promoCode"/>

    <button @click="presenter.bookRoom()" :disabled="presenter.viewModel.loading">
      {{ presenter.viewModel.loading ? "Réservation..." : "Réserver" }}
    </button>

    <p v-if="presenter.viewModel.displayErrorMessage" class="error">{{ presenter.viewModel.message }}</p>
    <p v-if="presenter.viewModel.displaySuccessMessage" class="success">
      {{ presenter.viewModel.message }}
    </p>

  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

import {BookingPresenter} from "@/components/BookingPresenter.ts";
import {RestApiBookingRepository} from "@/api/RestApiBookingRepository.ts";

const presenter = ref(new BookingPresenter(new RestApiBookingRepository()));

</script>


<style scoped>
.booking {
  display: flex;
  flex-direction: column;
  max-width: 300px;
}

input, select {
  margin-bottom: 10px;
  padding: 5px;
}

button {
  margin-top: 10px;
}

.error {
  color: red;
}

.success {
  color: green;
}
</style>
