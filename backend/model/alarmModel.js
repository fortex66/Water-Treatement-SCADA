const sequelize = require("../config/databaseConfig");
const { DataTypes } = require("sequelize");

// alarm table
const alarm = sequelize.define(
  "alarm",
  {
    alarmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    alarmMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    // 다른 옵션들 기입
    timestamps: false, // 기본 옵션으로 선택되는 설정을 취소하기 위해
    sequelize,
    tableName: "alarm",
    modelName: "alarm",
  }
);

// alarm List table
const alarmList = sequelize.define(
  "alarmList",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    errorDate: {
      type: DataTypes.DATE, // Sequelize에서 TIMESTAMP를 다루기 위해 DATE 타입 사용
      allowNull: false,
      defaultValue: DataTypes.NOW // 현재 시간을 기본값으로 설정
    },
    fixDate: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    alarmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "alarm",
        key: "alarmId",
      },
    },
  },
  {
    // 다른 옵션들 기입
    timestamps: false, // 기본 옵션으로 선택되는 설정을 취소하기 위해
    sequelize,
    tableName: "alarmList",
    modelName: "alarmList",
  }
);

alarm.hasMany(alarmList, { foreignKey: "alarmId" });
alarmList.belongsTo(alarm, { foreignKey: "alarmId" });

module.exports = { alarmList, alarm };
