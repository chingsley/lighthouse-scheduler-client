import React, { useState, useEffect } from 'react';

import Header from './Header';
import Show from './Show';
import Empty from './Empty';
import Status from './Status';
import Error from './Error';
import Confirm from './Confirm';
import Form from '../Form';

import 'components/Appointment/styles.scss';
import useVisualMode from 'hooks/useVisualMode';
const EMPTY = 'EMPTY';
const SHOW = 'SHOW';
const CREATE = 'CREATE';
const SAVING = 'SAVING';
const DELETING = 'DELETING';
const ERROR = 'ERROR';
const CONFIRM = 'CONFIRM';
const EDIT = 'EDIT';

export default function Appointment(props) {
  const { mode, back, transition } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userInput, setUserInput] = useState({});

  const onCancel = () => back();

  const save = (name, interviewer) => {
    if (!name || !interviewer) {
      console.log(
        'Error: You must enter student name and choose an interviewer'
      );
      return;
    }
    const interview = {
      student: name,
      interviewer,
    };
    setUserInput(interview);
    transition(SAVING);
    props
      .bookInterview(props.id, interview, isEditing)
      .then((res2) => {
        transition(SHOW);
      })
      .catch((err) => {
        // console.log({ err });
        setError(
          (err.response && err.response.data && err.response.data.error) ||
          'Failed to save Appointment'
        );
        transition(ERROR, true);
      });
  };

  const handleDelete = () => {
    transition(DELETING, true); // we pass replace=true b/c we want to replace the last mode (CONFIRM) with SAVING. If there's an error, when we close error modal, we don't want to go back to CONFIRM mode, instead we want to go back to SHOW mode
    props
      .cancelInterview()
      .then(() => {
        transition(EMPTY);
      })
      .catch((err) => {
        setError(
          (err.response && err.response.data && err.response.data.error) ||
          'Could not cancel Appointment'
        );
        transition(ERROR, true);
      });
  };

  const startEdit = () => {
    transition(EDIT);
    setIsEditing(true);
  };

  useEffect(() => {
    if (mode === SHOW && !props.interview) {
      transition(EMPTY);
    }
    if (mode === EMPTY && props.interview) {
      transition(SHOW);
    }
  }, [props.interview, transition, mode]);

  const display = (mode) => {
    switch (mode) {
      case EMPTY:
        return <Empty onAdd={() => transition(CREATE)} />;
      case SHOW:
        return (
          <Show
            {...props.interview}
            onDelete={() => transition(CONFIRM)}
            onEdit={startEdit}
          />
        );
      case CREATE:
        return (
          <Form
            onCancel={onCancel}
            interviewers={props.interviewers}
            onSave={save}
            userInput={userInput}
          />
        );
      case EDIT:
        return (
          <Form
            student={props.interview.student}
            interviewer={props.interview.interviewer.id}
            interviewers={props.interviewers}
            onCancel={onCancel}
            onSave={save}
            userInput={userInput}
          />
        );
      case SAVING:
        return <Status message={'Saving'} />;
      case DELETING:
        return <Status message={'Deleting'} />;
      case ERROR:
        return <Error message={error} onClose={onCancel} />;
      case CONFIRM:
        return (
          <Confirm
            message={'Are you sure you want to delete this appointment?'}
            onCancel={onCancel}
            onConfirm={handleDelete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <article className='appointment' data-testid='appointment'>
      <Header time={props.time} />
      {display(mode)}
    </article>
  );
}
