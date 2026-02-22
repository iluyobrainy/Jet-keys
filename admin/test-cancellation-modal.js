// Test script to check if there are cancelled bookings in the database
// Run this in the browser console on the admin cancellation page

console.log('Testing cancellation page...')

// Check if there are any cancelled bookings
fetch('/api/admin/cancelled-bookings')
  .then(response => response.json())
  .then(data => {
    console.log('Cancelled bookings data:', data)
    if (data.length === 0) {
      console.log('❌ No cancelled bookings found in database')
      console.log('💡 To test the modal, create a cancelled booking first')
    } else {
      console.log('✅ Found', data.length, 'cancelled bookings')
    }
  })
  .catch(error => {
    console.log('❌ Error fetching cancelled bookings:', error)
  })

// Test modal functionality
console.log('Testing modal state...')
console.log('showDetailsModal:', window.showDetailsModal)
console.log('selectedBooking:', window.selectedBooking)




