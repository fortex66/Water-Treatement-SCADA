const sequelize = require("./databaseConfig");
const { User } = require("../model/userModel");
const { logIndex } = require("../model/loggModel");

sequelize
  .sync()
  .then(async () => {
    //     // 초기 사용자 생성
    //     const defaultPassword = "1234";
    //     await User.findOrCreate({
    //       where: { username: "admin" },
    //       defaults: { password: defaultPassword },
    //     });
    //     await logIndex.create(); // logIndex 테이블 초기 튜플 생성
    //     // 트리거 생성
    //     const triggerSQL = `
    //       CREATE TRIGGER alarm_BEFORE_UPDATE
    //       BEFORE UPDATE ON alarm
    //       FOR EACH ROW
    //       BEGIN
    //         IF OLD.status = 1 AND NEW.status = 0 THEN
    //           UPDATE alarmList
    //           SET fixDate = NOW()
    //           WHERE alarmId = NEW.alarmId AND fixDate IS NULL;
    //         END IF;
    //       END;
    //     `;
    //     await sequelize.query(triggerSQL);
    //     // 초기 데이터 삽입
    //     const insertSQL = `
    //     INSERT INTO alarm (alarmId, alarmMessage, status, address) VALUES
    //     (1, 'M204] M-01 맴브레인 탈리브로워[상시] TRIP', 0, 'M00005100'),
    //     (2, 'M204] M-02 맴브레인 탈리브로워[예비] TRIP', 0, 'M00005101'),
    //     (3, 'M203] M-03 흡착제 유동브로워[상시] TRIP', 0, 'M00005102'),
    //     (4, 'M203] M-04 흡착제 유동브로워[예비] TRIP', 0, 'M00005103'),
    //     (5, 'M101-A] M-05 유입펌프[A] TRIP', 0, 'M00005104'),
    //     (6, 'M101-B] M-06 유입펌프[B] TRIP', 0, 'M00005105'),
    //     (7, 'M207-A] M-07 흡입펌프[A] TRIP', 0, 'M00005106'),
    //     (8, 'M207-B] M-08 흡입펌프[B] TRIP', 0, 'M00005107'),
    //     (9, 'M210-A] M-09 방류펌프[A] TRIP', 0, 'M00005108'),
    //     (10, 'M210-B] M-10 방류펌프[B] TRIP', 0, 'M00005109'),
    //     (11, 'M301-A] M-11 U/V재생조[A] 이송펌프 TRIP', 0, 'M0000510A'),
    //     (12, 'M301-B] M-12 U/V재생조[B] 이송펌프 TRIP', 0, 'M0000510B'),
    //     (13, 'M304] M-13 흡착조 반송펌프[상시] TRIP', 0, 'M0000510C'),
    //     (14, 'M304] M-14 흡착조 반송펌프[예비] TRIP', 0, 'M0000510D'),
    //     (15, 'M302] M-15 U/V 교반기 TRIP', 0, 'M0000510E'),
    //     (16, 'M208] M-16 역세펌프 INV ALM', 0, 'M0000510F'),
    //     (17, 'M212] 유출V/V #1 FWD ALM', 0, 'M00005110'),
    //     (18, 'M212] 유출V/V #1 RWD ALM', 0, 'M00005111'),
    //     (19, 'M212] 유출V/V #2 FWD ALM', 0, 'M00005112'),
    //     (20, 'M212] 유출V/V #2 RWD ALM', 0, 'M00005113'),
    //     (21, 'M212] 유출V/V #3 FWD ALM', 0, 'M00005114'),
    //     (22, 'M212] 유출V/V #3 RWD ALM', 0, 'M00005115'),
    //     (23, 'M213] 수역세V/V #1 FWD ALM', 0, 'M00005116'),
    //     (24, 'M213] 수역세V/V #1 RWD ALM', 0, 'M00005117'),
    //     (25, 'M213] 수역세V/V #2 FWD ALM', 0, 'M00005118'),
    //     (26, 'M213] 수역세V/V #2 RWD ALM', 0, 'M00005119'),
    //     (27, 'M213] 수역세V/V #3 FWD ALM', 0, 'M0000511A'),
    //     (28, 'M213] 수역세V/V #3 RWD ALM', 0, 'M0000511B'),
    //     (29, 'M102] 유입수조 LV센서 이상', 0, 'M0000511C'),
    //     (30, 'M201] 흡착조 TAMK LV센서 이상', 0, 'M0000511D'),
    //     (31, 'M209] 처리수조 LV센서 이상', 0, 'M0000511E'),
    //     (32, 'M302] 재생조 LV센서 이상', 0, 'M0000511F'),
    //     (33, 'M208] 역세펌프 모터정격 RPM입력 ERROR', 0, 'M00005120'),
    //     (34, 'M208] 역세펌프 주파수설정 초과 ERROR', 0, 'M00005121'),
    //     (35, 'V/V #1 FWD ALM', 0, 'M00005122'),
    //     (36, 'V/V #1 RWD ALM', 0, 'M00005123'),
    //     (37, 'V/V #2 FWD ALM', 0, 'M00005124'),
    //     (38, 'V/V #2 RWD ALM', 0, 'M00005125'),
    //     (39, 'VNC원격_Alieve Time Out', 0, 'M00005126');
    //     `;
    //     await sequelize.query(insertSQL);
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
