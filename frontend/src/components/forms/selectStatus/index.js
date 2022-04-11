import React, { useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import './index.css';

const SelectSatus = ({ data, setData }) => {
  const [allStatus, setAllStatus] = useState([...data.status]);

  const styles = {
    multiValue: (base, state) => {
      return state.data.isDeleteable ? base : { ...base, backgroundColor: 'gray' };
    },
    multiValueLabel: (base, state) => {
      return state.data.isDeleteable
        ? base
        : { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 };
    },
    multiValueRemove: (base, state) => {
      return state.data.isDeleteable ? base : { ...base, display: 'none' };
    },
  };

  const orderOptions = value => value.sort((a, b) => a.isDeleteable === b.isDeleteable);

  const onChange = (value, actionMeta) => {
    switch (actionMeta.action) {
      case 'remove-value':
      case 'pop-value':
        if (!actionMeta.removedValue.isDeleteable) {
          return;
        }
        break;
      case 'clear':
        value = data.status.filter((v) => !v.isDeleteable);
        break;
      default:
        break;
    }
    value = orderOptions(value);
    setData({
      ...data,
      status: value
    });
  }

  const onCancelableChange = (newCancelableStatus, actionMeta) => {
    const newAllStatus = [...allStatus];
    let idx;
    switch (actionMeta.action) {
      case 'remove-value':
      case 'pop-value':
        idx = allStatus.findIndex(sts => sts.value === actionMeta.removedValue.value);
        newAllStatus[idx].isCancelable = false;
        break;
      case 'select-option':
        idx = allStatus.findIndex(sts => sts.value === actionMeta.option.value);
        newAllStatus[idx].isCancelable = true;
        break;
      case 'clear':
        return;
      default:
        break;
    }
    setData({
      ...data,
      status: newAllStatus
    });
    setAllStatus(newAllStatus);
    return;
  }

  const onCreate = statusName => {
    const newStatus = {
      isDeleteable: true,
      isCancelable: true,
      label: statusName,
      value: statusName.toLocaleUpperCase()
    };
    setAllStatus([...allStatus, newStatus]);
    setData({
      ...data,
      status: [...data.status, newStatus]
    })
  }

  return (
    <>
      <label htmlFor="status">
        Status de Pedidos *
        <div className="select-div">
          <CreatableSelect
            isMulti
            styles={styles}
            value={data.status}
            onCreateOption={onCreate}
            onChange={onChange}
            options={allStatus}
            defaultValue={[...allStatus]}
          />
        </div>
      </label>

      <label htmlFor="cancelable-status">
        Status que Pedidos São Canceláveis *
        <div className="select-div">
          <Select
            isMulti
            value={data.status.filter(sts => sts.isCancelable)}
            onChange={onCancelableChange}
            options={allStatus
              .filter(sts => sts.value !== 'FINALIZADO' && sts.value !== 'CANCELADO')}
            defaultValue={[...allStatus]}
          />
        </div>
      </label>
    </>
  );
};

export default SelectSatus;