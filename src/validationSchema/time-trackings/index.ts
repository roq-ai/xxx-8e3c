import * as yup from 'yup';

export const timeTrackingValidationSchema = yup.object().shape({
  time_spent: yup.number().integer().required(),
  user_id: yup.string().nullable(),
  client_id: yup.string().nullable(),
});
