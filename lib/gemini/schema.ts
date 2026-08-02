export const itinerarySchema = {
  type: "object",
  properties: {
    destination: { 
      type: "string",
      description: "Nama destinasi perjalanan"
    },
    total_budget_estimate: { 
      type: "number",
      description: "Estimasi total budget dalam Rupiah"
    },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day_number: { 
            type: "integer",
            description: "Nomor hari (dimulai dari 1)"
          },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { 
                  type: "string",
                  description: "Waktu aktivitas dalam format HH:mm"
                },
                location_name: { 
                  type: "string",
                  description: "Nama lokasi atau tempat"
                },
                activity_description: { 
                  type: "string",
                  description: "Deskripsi aktivitas yang akan dilakukan"
                },
                estimated_cost: { 
                  type: "number",
                  description: "Estimasi biaya aktivitas dalam Rupiah"
                }
              },
              required: ["time", "location_name", "activity_description", "estimated_cost"]
            }
          }
        },
        required: ["day_number", "activities"]
      }
    }
  },
  required: ["destination", "total_budget_estimate", "days"]
}