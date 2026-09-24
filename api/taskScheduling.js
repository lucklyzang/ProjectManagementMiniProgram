import request from '@/api/request';

// 维修任务列表查询
export function repairsList (state,proId,flag) {
    return request({
      url: `project/bxTask/new/queryTask?state=${state}&proId=${proId}&flag=${flag}`,
      method: 'get'
    })
  };

// 维修任务详情查询
export function repairsDetails (id) {
  return request({
    url: `project/bxTask/query/${id}`,
    method: 'get'
  })
};

// 维修任务任务类型查询
export function getRepairsTaskType (proId) {
  return request({
    url: `project/bxTaskType/init/${proId}`,
    method: 'get'
  })
};

// 维修任务创建
export function createRepairsTask (data) {
  return request({
    url: 'project/bxTask/add',
    method: 'post',
    data
  })
};

// 维修任务分配
export function assignRepairsTask (data) {
  return request({
    url: 'project/bxTask/assignTask',
    method: 'put',
    data
  })
};

// 维修任务延迟
export function delayRepairsTask (data) {
  return request({
    url: 'project/bxTask/delayTask',
    method: 'put',
    data
  })
};

// 维修任务取消
export function cancelRepairsTask (data) {
  return request({
    url: 'project/bxTask/cancelTask',
    method: 'put',
    data
  })
};

// 维修任务完成
export function completeRepairsTask (data) {
  return request({
    url: 'project/bxTask/completeTask',
    method: 'put',
    data
  })
};

// 维修任务编辑

export function editRepairsTask (data) {
  return request({
    url: 'project/bxTask/update',
    method: 'put',
    data
  })
};

// 维修任务取消原因查询
export function queryRepairsTaskCancelReason(proId) {
  return request({
    url: `project/cancel/queryAll?proId=${proId}`,
    method: 'get'
  })
};

// 维修任务延迟原因查询
export function queryRepairsTaskDelayReason(proId) {
  return request({
    url: `project/delay/queryAll?proId=${proId}`,
    method: 'get'
  })
};

// 维修任务工具查询
export function queryRepairsTaskTool(proId) {
  return request({
    url: `project/bxTool/queryAll?proId=${proId}`,
    method: 'get'
  })
};

// 维修任务物料查询
export function queryRepairsTaskMaterial(proId) {
  return request({
    url: `project/bxMaterial/queryAllFromStorageServer?proId=${proId}`,
    method: 'get'
  })
};

// 查询建筑信息
export function queryStructure(proId) {
  return request({
    url: `project/structure/queryAll?proId=${proId}`,
    method: 'get'
  })
};

// 查询科室信息
export function queryDepartment(proId,structId) {
  return request({
    url: `project/department/queryAll?proId=${proId}&structId=${structId}`,
    method: 'get'
  })
};

// 查询空间信息
export function querySpace(proId,depId) {
  return request({
    url: `project/bxSpace/queryAll?proId=${proId}&depId=${depId}`,
    method: 'get'
  })
};

// 查询维修员
export function getTransporter(proId) {
  return request({
    url: `project/worker/workerList/${proId}`,
    method: 'get'
  })
};
