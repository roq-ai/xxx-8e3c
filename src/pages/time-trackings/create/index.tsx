import AppLayout from 'layout/app-layout';
import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Box,
  Spinner,
  FormErrorMessage,
  Switch,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberInputField,
  NumberIncrementStepper,
  NumberInput,
} from '@chakra-ui/react';
import { useFormik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import { FiEdit3 } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { createTimeTracking } from 'apiSdk/time-trackings';
import { Error } from 'components/error';
import { timeTrackingValidationSchema } from 'validationSchema/time-trackings';
import { AsyncSelect } from 'components/async-select';
import { ArrayFormField } from 'components/array-form-field';
import { AccessOperationEnum, AccessServiceEnum, requireNextAuth, withAuthorization } from '@roq/nextjs';
import { compose } from 'lib/compose';
import { UserInterface } from 'interfaces/user';
import { ClientInterface } from 'interfaces/client';
import { getUsers } from 'apiSdk/users';
import { getClients } from 'apiSdk/clients';
import { TimeTrackingInterface } from 'interfaces/time-tracking';

function TimeTrackingCreatePage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSubmit = async (values: TimeTrackingInterface, { resetForm }: FormikHelpers<any>) => {
    setError(null);
    try {
      await createTimeTracking(values);
      resetForm();
      router.push('/time-trackings');
    } catch (error) {
      setError(error);
    }
  };

  const formik = useFormik<TimeTrackingInterface>({
    initialValues: {
      time_spent: 0,
      user_id: (router.query.user_id as string) ?? null,
      client_id: (router.query.client_id as string) ?? null,
    },
    validationSchema: timeTrackingValidationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
  });

  return (
    <AppLayout>
      <Box bg="white" p={4} rounded="md" shadow="md">
        <Box mb={4}>
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Create Time Tracking
          </Text>
        </Box>
        {error && (
          <Box mb={4}>
            <Error error={error} />
          </Box>
        )}
        <form onSubmit={formik.handleSubmit}>
          <FormControl id="time_spent" mb="4" isInvalid={!!formik.errors?.time_spent}>
            <FormLabel>Time Spent</FormLabel>
            <NumberInput
              name="time_spent"
              value={formik.values?.time_spent}
              onChange={(valueString, valueNumber) =>
                formik.setFieldValue('time_spent', Number.isNaN(valueNumber) ? 0 : valueNumber)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formik.errors.time_spent && <FormErrorMessage>{formik.errors?.time_spent}</FormErrorMessage>}
          </FormControl>
          <AsyncSelect<UserInterface>
            formik={formik}
            name={'user_id'}
            label={'Select User'}
            placeholder={'Select User'}
            fetcher={getUsers}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record?.email}
              </option>
            )}
          />
          <AsyncSelect<ClientInterface>
            formik={formik}
            name={'client_id'}
            label={'Select Client'}
            placeholder={'Select Client'}
            fetcher={getClients}
            renderOption={(record) => (
              <option key={record.id} value={record.id}>
                {record?.name}
              </option>
            )}
          />
          <Button isDisabled={formik?.isSubmitting} colorScheme="blue" type="submit" mr="4">
            Submit
          </Button>
        </form>
      </Box>
    </AppLayout>
  );
}

export default compose(
  requireNextAuth({
    redirectTo: '/',
  }),
  withAuthorization({
    service: AccessServiceEnum.PROJECT,
    entity: 'time_tracking',
    operation: AccessOperationEnum.CREATE,
  }),
)(TimeTrackingCreatePage);
