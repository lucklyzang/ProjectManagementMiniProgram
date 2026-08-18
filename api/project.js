import request from '@/api/request';
import Qs from 'qs'

// 查询任务类型
export function queryTaskType(data) {
  return request({
    url: 'project/bxTaskType/queryAll',
    method: 'get',
    params: data
  })
};

// 查询目的地(科室)
export function queryAllDestination(proId) {
  return request({
    url: `project/department/dict/${proId}`,
    method: 'get'
  })
};

// 根据科室查询房间信息
export function departmentRoom(data) {
  return request({
    url: 'project/bxSpace/loadData',
    method: 'get',
    params: data
  })
};

// 巡检问题上报
export function reportProblem(data) {
  return request({
    url: 'project/bxTask/reportProblem',
    method: 'post',
    data
  })
};

// 查询工程任务列表
export function getMaintainTask(data) {
  return request({
    url: 'project/bxTask/queryTask',
    method: 'get',
    params: data
  })
};

// 任务取消
export function projectTaskCancel(data) {
  return request({
    url: 'project/bxTask/cancelTask',
    method: 'put',
    data
  })
};

// 工程任务催单
export function projectTaskReminder(proId,taskId) {
  return request({
    url: `project/bxTask/reminder/${proId}/${taskId}`,
    method: 'get'
  })
};

// 任务取消原因
export function projectTaskCancelReason(data) {
  return request({
    url: 'project/cancel/queryAll',
    method: 'get',
    params: data
  })
};

// 维修任务详情查询
export function repairsDetails (id) {
  return request({
    url: `project/bxTask/query/${id}`,
    method: 'get'
  })
};

// 维修任务图片查询
export function repairsImage (data) {
  return request({
    url: 'project/bxRepairTaskImage/queryAll',
    method: 'get',
		params: data
  })
};

// 查询空间信息
export function querySpace(proId,depId) {
  return request({
    url: `project/bxSpace/queryAll?proId=${proId}&depId=${depId}`,
    method: 'get'
  })
}
