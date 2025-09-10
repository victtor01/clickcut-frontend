export function objectToFormData(dto: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(dto).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value, value.name);
    } 

		else {
      formData.append(key, value);
    }
  });

  return formData;
}