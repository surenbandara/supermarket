import * as Yup from 'yup';

export const ConfigurationSchema = Yup.object().shape({
  name: Yup.string()
    .max(35)
    .trim()
    .required('Required'),
  value: Yup.string()
    .max(35)
    .trim()
    .required('Required'),
});
