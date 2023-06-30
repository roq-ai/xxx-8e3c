import * as yup from 'yup';

export const invitationValidationSchema = yup.object().shape({
  inviter_id: yup.string().nullable(),
  invitee_id: yup.string().nullable(),
});
